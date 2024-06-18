/* 
 * RIFFWAVE.js v0.03 - Audio encoder for HTML5 <audio> elements.
 * Copyleft 2011 by Pedro Ladaria <pedro.ladaria at Gmail dot com>
 *
 * Public Domain
 *
 * Changelog:
 *
 * 0.01 - First release
 * 0.02 - New faster base64 encoding
 * 0.03 - Support for 16bit samples
 *
 * Notes:
 *
 * 8 bit data is unsigned: 0..255
 * 16 bit data is signed: -32,768..32,767
 *
 */

var FastBase64 = {
    chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    encLookup: [],

    Init: function() {
        for (var i = 0; i < 4096; i++) {
            this.encLookup[i] = this.chars[i >> 6] + this.chars[i & 0x3F];
        }
    },

    Encode: function(src) {
        var len = src.length;
        var dst = '';
        var i = 0;
        while (len > 2) {
            var n = (src[i] << 16) | (src[i + 1] << 8) | src[i + 2];
            dst += this.encLookup[n >> 12] + this.encLookup[n & 0xFFF];
            len -= 3;
            i += 3;
        }
        if (len > 0) {
            var n1 = (src[i] & 0xFC) >> 2;
            var n2 = (src[i] & 0x03) << 4;
            if (len > 1) n2 |= (src[++i] & 0xF0) >> 4;
            dst += this.chars[n1];
            dst += this.chars[n2];
            if (len == 2) {
                var n3 = (src[i++] & 0x0F) << 2;
                n3 |= (src[i] & 0xC0) >> 6;
                dst += this.chars[n3];
            }
            if (len == 1) dst += '=';
            dst += '=';
        }
        return dst;
    } // end Encode
}

var RIFFWAVE = function(data) {
    this.data = [];        // Array containing audio samples
    this.wav = [];         // Array containing the generated wave file
    this.dataURI = '';     // http://en.wikipedia.org/wiki/Data_URI_scheme

    this.header = {                         // OFFS SIZE NOTES
        chunkId      : [0x52,0x49,0x46,0x46], // 0    4    "RIFF" = 0x52494646
        chunkSize    : 0,                     // 4    4    36+SubChunk2Size = 4+(8+SubChunk1Size)+(8+SubChunk2Size)
        format       : [0x57,0x41,0x56,0x45], // 8    4    "WAVE" = 0x57415645
        subChunk1Id  : [0x66,0x6d,0x74,0x20], // 12   4    "fmt " = 0x666d7420
        subChunk1Size: 16,                    // 16   4    16 for PCM
        audioFormat  : 1,                     // 20   2    PCM = 1
        numChannels  : 1,                     // 22   2    Mono = 1, Stereo = 2...
        sampleRate   : 8000,                  // 24   4    8000, 44100...
        byteRate     : 0,                     // 28   4    SampleRate*NumChannels*BitsPerSample/8
        blockAlign   : 0,                     // 32   2    NumChannels*BitsPerSample/8
        bitsPerSample: 8,                     // 34   2    8 bits = 8, 16 bits = 16
        subChunk2Id  : [0x64,0x61,0x74,0x61], // 36   4    "data" = 0x64617461
        subChunk2Size: 0                      // 40   4    data size = NumSamples*NumChannels*BitsPerSample/8
    };

    function u32ToArray(i) {
        return [i & 0xFF, (i >> 8) & 0xFF, (i >> 16) & 0xFF, (i >> 24) & 0xFF];
    }

    function u16ToArray(i) {
        return [i & 0xFF, (i >> 8) & 0xFF];
    }

    function split16bitArray(d) {
        var r = [];
        var j = 0;
        var len = d.length;
        for (var i = 0; i < len; i++) {
            r[j++] = d[i] & 0xFF;
            r[j++] = (d[i] >> 8) & 0xFF;
        }
        return r;
    }

    this.Make = function(data) {
        if (data instanceof Array) this.data = data;
        this.header.blockAlign = (this.header.numChannels * this.header.bitsPerSample) >> 3;
        this.header.byteRate = this.header.blockAlign * this.sampleRate;
        this.header.subChunk2Size = this.data.length * (this.header.bitsPerSample >> 3);
        this.header.chunkSize = 36 + this.header.subChunk2Size;

        this.wav = this.header.chunkId.concat(
            u32ToArray(this.header.chunkSize),
            this.header.format,
            this.header.subChunk1Id,
            u32ToArray(this.header.subChunk1Size),
            u16ToArray(this.header.audioFormat),
            u16ToArray(this.header.numChannels),
            u32ToArray(this.header.sampleRate),
            u32ToArray(this.header.byteRate),
            u16ToArray(this.header.blockAlign),
            u16ToArray(this.header.bitsPerSample),    
            this.header.subChunk2Id,
            u32ToArray(this.header.subChunk2Size),
            (this.header.bitsPerSample == 16) ? split16bitArray(this.data) : this.data
        );
        this.dataURI = 'data:audio/wav;base64,' + FastBase64.Encode(this.wav);
    };

    if (data instanceof Array) this.Make(data);

}; // end RIFFWAVE

FastBase64.Init();

window.onload = function() {
    window.app = {};

    app.local_storage = function() {
        return 'localStorage' in window && window['localStorage'] !== null ? true : false;
    }

    app.load_cfg = function(name) {
        var i = localStorage.getItem(name);

        if (!app.local_storage || !i) {
            return false;
        }

        return JSON.parse(i);
    }

    app.save_cfg = function(name, obj) {
        if (!app.local_storage) {
            return false;
        }

        localStorage.setItem(name, JSON.stringify(obj));
    }

    app.create_cv = function(id, w, h, save, dom) {
        var cv = {};

        !app.cv ? app.cv = {} : '';

        cv.cv = document.createElement('canvas');
        cv.cv.width = w;
        cv.cv.height = h;
        cv.ctx = cv.cv.getContext('2d');

        if (save) {
            app.cv[id] = cv;
        }

        if (dom) {
            document.getElementById('cvs').appendChild(cv.cv);
            cv.cv.setAttribute('width', w);
            cv.cv.setAttribute('height', h);
            cv.cv.setAttribute('id', id);
            cv.cv.setAttribute('class', 'cv');
        }

        return cv;
    }

    app.init_cv = function(id, create, w, h, save, dom) {
        if (create) {
            app.create_cv(id, w, h, save, dom)
        } else {
            app.cv[id].cv = document.getElementById(id);

            if (!app.cv[id].cv || !app.cv[id].cv.getContext) {
                return false;
            } else {
                app.cv[id].ctx = app.cv[id].cv.getContext('2d');
            }
        }
    }

    app.gen_sfx_data = function(len, fin, fout, fn) {
        var data = [];
        var f;

        for (var i = 0; i < len + fout; i++) {
            if (i >= len) {
                data[i] = 128;
                continue;
            }

            f = (i < fin) ? i / fin :
                ((i >= len - fin) ? 1 - (i - len + fin - 1) / fin : 1);

            data[i] = Math.round(128 + fn(i) * f);
        }

        return data;
    }

    app.gen_audio_elem = function(data) {
        var wave = new RIFFWAVE(data);
        var audio = new Audio(wave.dataURI);
        return audio;
    }

    app.play_sfx = function(sfx_name) {
        if (app.url_params.sfx == 0) {
            return false;
        }

        app.sfx[sfx_name].play();
    }

    app.fps_tout_fn = function() {
        app.last_fps = app.fps;
        app.fps = 0;
    }

    app.grant_achv = function(n, ct, t, i) {
        var a = app.achv;
        a[n][0] += i;
        clearTimeout(app[n + '_tout']);
        if (a[n][0] === ct) {
            app.toggle_bool(n + '_medal', 3000, true);
            a[n][0] = 0;
            a[n][1] += 1;
            app.play_sfx('exp_1');
        } else {
            app.set_timeout(n + '_tout', function() {
                a[n][0] = 0;
            }, t);
        }
    }

    app.toggle_bool = function(b, t, v, ctx, c) {
        ctx === undefined ? ctx = app : '';
        v === undefined ? v = false : '';
        ctx[b] = v;
        clearTimeout(ctx[b + '_tout']);
        ctx[b + '_tout'] = setTimeout(function() {
            ctx[b] = v ? false : true;

            if (c) {
                c();
            }
        }, t);
    }

    app.set_timeout = function(name, fn, t) {
        app[name + '_tout'] = setTimeout(fn, t);
    }

    app.init_frnz_assets = function() {
        if (app.url_params.gore === 1) {
            app.draw_level(app.cv.frenzy_bg.ctx);

            var d = app.cv.frenzy_bg.ctx.getImageData(0, 0, app.w, app.h);
            var dd = d.data;
            var l = dd.length;
            var nd = app.cv.frenzy_bg.ctx.createImageData(app.w, app.h);
            var ndd = nd.data;

            for (var a = 0; a < l; a += 4) {
                ndd[a] = dd[a];
                ndd[a + 1] = 0;
                ndd[a + 2] = 0;
                ndd[a + 3] = 255;
            }

            app.cv.frenzy_bg.ctx.putImageData(nd, 0, 0);
        }
    }

    app.init_noise = function() {
        if (app.url_params.noise === 1) {
            var pat_cv = app.create_cv('pat_cv', 240, 240);
            var pat_ctx = pat_cv.ctx;
            var alpha;
            var color;

            app.noise_frames = [];
            app.crnt_noise_frame = 0;
            app.noise_rate = 0;

            for (var a = 0; a < 16; a += 1) {
                pat_ctx.clearRect(0, 0, pat_cv.cv.width, pat_cv.cv.height)

                for (var r = 0; r < pat_cv.cv.height; r += 6) {
                    for (var c = 0; c < pat_cv.cv.width; c += 6) {
                        if (Math.random() < 0.5) {
                            alpha = Math.random() / 2;
                            color = Math.round(Math.random() * 64);
                            pat_ctx.fillStyle = 'rgba(' + Math.round(Math.random() * 30) + ',' + Math.round(Math.random() * 30) + ',' + Math.round(Math.random() * 30) + ',' + alpha + ')';
                            pat_ctx.fillRect(c, r, 6, 6);
                        }
                    }
                }
                app.noise_frames.push(app.cv.noise.ctx.createPattern(pat_cv.cv, 'repeat'));
            }
        }
    }

    app.draw_noise = function(ctx) {
        if (app.url_params.noise === 1) {
            if (app.noise_rate === 1) {
                app.noise_rate = 0;
                ctx.clearRect(0, 0, app.w, app.h);
                ctx.fillStyle = app.noise_frames[app.crnt_noise_frame];
                ctx.fillRect(0, 0, app.w, app.h);

                app.crnt_noise_frame = app.crnt_noise_frame + 1 === app.noise_frames.length ? 0 : app.crnt_noise_frame + 1;
            } else {
                app.noise_rate += 1;
            }
        }
    }

    app.create_obj = function(o_n, c) {
        var id;
        var obj = new app[o_n]();

        if (app[obj.type + '_id'].length > 0) {
            id = app[obj.type + '_id'].pop();
        } else {
            id = app[obj.type].length;
        }

        obj.id = id;

        c ? c(obj) : '';

        app[obj.type][id] = obj;

        return obj;
    }

    app.remove_obj = function(o) {
        app[o.type + '_id'].push(o.id);
        delete app[o.type][o.id];
    }

    app.update_bot_track = function(t, v) {
        var b = app.bot_track;

        b.spawn[t] += v ? 1 : 0;
        b.kill[t] += v ? 0 : 1;
        b.alive[t] += v ? 1 : -1;
        b.alive_count += v ? 1 : -1;
    }

    app.spawn_bot = function(t) {
        var bot = app.create_obj('Bot');
        var dir = Math.random() > 0.5 ? 0 : 1;

        bot.b_t = t || 0;
        bot.dir = dir;
        bot.dx_max += app.wave * 0.3;

        if (Math.random() > 0.7) {
            bot.x = Math.random() * app.w;
            bot.y = - bot.h / 2;
        } else {
            bot.y = Math.random() * app.h;
            bot.x = - bot.w / 2;
        }

        for (var k in app.bot_types[t]) {
            bot[k] = app.bot_types[t][k];
        }

        bot.anim = 'bot_walk_' + app.bot_types[t].skin + '_1';
        app.update_bot_track(t, true);
    }

    app.update_player = function() {
        var p = app.plr;

        if (p.left || p.right) {
            p.anim = 'player_run_' + p.skin;
        } else {
            p.anim = 'player_idle_' + p.skin;
        }

        p.update_pos();
        p.update_anim_frame();
        p.move();
        p.update_jump();
        p.start_fall();
        p.lvl_pads_coll();
        p.lvl_bnds_coll();
        p.update_phs();
        p.bots_coll();
        p.update_grab();
        p.update_attack();
        p.update_hp();
    }

    app.set_screen_shake = function(t, d) {
        if (!app.shake_tout) {
            app.shake = true;
            app.shake_d = d || 2;

            clearTimeout(app.shake_tout);

            app.shake_tout = setTimeout(function() {
                app.shake = false;
                delete app.shake_tout;
            }, t);
        }
    }

    app.action_mngr = function() {
        var t = 0;

        if (!app.can_spawn || app.wave_break || app.bot_track.alive_count >= app.max_bot_count + Math.min(app.wave_tmr / 15, 10)) {
            return false;
        }

        app.toggle_bool('can_spawn', app.bot_spawn_delay);

        if (app.bot_track.alive[0] < Math.max((app.wave / 2.2) - (app.wave / 4) * (app.wave / app.wave_peak), 2) || app.wave < 1) {
            t = 0;
        } else {
            app.bot_chances.forEach(function(elem, elem_id) {
                if (Math.random() < elem) {
                    t = elem_id + 1;
                }
            });
        }

        app.spawn_bot(t);
    }

    app.on_wave_start = function() {
        app.plr.dx_max < 15 ? app.plr.dx_max += 1 : '';

        app.max_bot_count = Math.floor(app.wave * app.bot_count_fn[0] + app.bot_count_fn[1]);
        app.bot_spawn_delay = (Math.max(125, 1500 - app.wave * 150));

        app.bot_chances_fn.forEach(function(elem, elem_id) {
            app.bot_chances[elem_id] = elem[0] * (app.wave / app.wave_peak) + elem[1];
        });

        app.wave_tmr = 0;
    }

    app.update = function() {
        var p = app.plr;

        app.fps += 1;

        switch (app.game_state) {
            case -1: {
                break;
            }
            case 0: {
                break;
            }
            case 1: {
                app.tmr += 0.033;
                app.wave_tmr += 0.033;

                app.update_player();

                app.bot.forEach(function(bot) {
                    if (bot.can_move || app.plr.is_grab === false || app.plr.is_grab !== bot.id) {
                        bot.move();
                        bot.lvl_pads_coll();
                        bot.lvl_bnds_coll();
                        bot.update_phs();
                        bot.update_jump();
                        bot.update_pos();
                    } else {
                        bot.lvl_pads_coll();
                    }
                    bot.php = bot.hp;
                    bot.hp += bot.dhp;

                    if (bot.dhp < 0) {
                        bot.sht_p('Blood', bot.x, bot.y, 0, Math.PI * 2, 15, -bot.dhp * (app.plr.frenzy ? 2 : 4), -bot.dhp);
                    }

                    if (bot.hp <= 0) {
                        if (this.can_move && this.pad_coll === false) {
                            app.update_hud_msg('aerial killer!!!');
                        }
                        p.update_kill_ct();
                        bot.destroy();
                    } else {
                        bot.dhp = 0;
                    }

                    if (bot.b_t !== 0) {
                        bot.anim = bot.anim.slice(0, bot.anim.length - 1) + (Math.random() > 0.5 ? 1 : 2);
                    }

                    bot.update_anim_frame();
                });

                app.blood.forEach(function(elem) {
                    elem.update_phs();
                    elem.update_pos();
                });

                app.body_part.forEach(function(elem) {
                    elem.update_phs();
                    elem.update_pos();
                    elem.lvl_pads_coll();
                    elem.update_anim_frame();
                });

                if (app.shake === true) {
                    app.shake_x = -6 * app.shake_d + app.round(Math.random() * 6 * app.shake_d + 6);
                    app.shake_y = -6 * app.shake_d + app.round(Math.random() * 6 * app.shake_d + 6);
                } else {
                    app.shake_x = 0;
                    app.shake_y = 0;
                }

                if (app.shake) {
                    app.cvs.style.top = app.shake_y + 'px';
                    app.cvs.style.left = app.shake_x + 'px';
                }

                app.cv.frenzy_bg.cv.style.zIndex = 1;
                app.cv.frenzy_bg.cv.style.opacity = (app.plr.frenzy ? 3 : 0) * (Math.random() * 0.3 + 0.1);

                if (app.plr.frenzy_end !== false) {
                    app.cv.frenzy_bg.cv.style.opacity = 1;
                    app.wave += 1;

                    app.on_wave_start();
                }

                if (app.plr.frenzy && !app.frenzy_sfx && app.url_params.sfx) {
                    app.frenzy_sfx = setInterval(function() {
                        if (app.plr.frenzy) {
                            app.play_sfx('frenzy');
                        } else {
                            delete app.frenzy_sfx;
                        }
                    }, 100);
                }

                app.action_mngr();

                break;
            }
            case 2: {
                if (!app.b_sum) {
                    app.b_sum = [];
                    for (var a = 0; a < 4; a += 1) {
                        app.spawn_bot(a);
                        app.b_sum[a] = app.bot[app.bot.length - 1];
                        app.b_sum[a].x = 0;
                        app.b_sum[a].y = 0;
                    }
                } else {
                    app.bot.forEach(function(elem) {
                        elem.update_anim_frame(true);
                    });
                }

                if ((p.left || p.right || p.jump || p.down) && !app.summary_menu_select_tout) {
                    app.select_smr_m(true);
                    app.toggle_bool('summary_menu_select_tout', 300, true);
                }

                if (app.smr_hvr_y && p.attack && !app.smr_active_tout) {
                    app.smr_hvr_x ? app.tweet_score() : app.restart_game();
                }

                break;
            }
        }
    }

    app.num_to_roman = function(n) {
        if (n >= 100) {
            return false;
        }

        var str = '';
        var substr = '';
        var c;
        var x;
        var i;

        x = n >= 10 ? Math.floor(n / 10) : 0;
        n -= x * 10;
        i = n;

        var o = {
            'x': x,
            'i': i
        }

        if (o.x) {
            if (o.x === 10) {
                str = 'c';
            } else if (o.x === 9) {
                str += 'xc';
            } else {
                if (o.x > 5) {
                    str += 'l';
                    o.x -= 5;
                }

                if (o.x > 3) {
                    substr = '';
                    o.x -= 3;
                    for (var a = 0; a < o.x; a += 1) {
                        substr = 'x' + substr;
                    }
                    substr += 'l';
                    str += substr;
                } else {
                    for (var a = 0; a < o.x; a += 1) {
                        str = 'x' + str;
                    }
                }
            }
        }

        if (o.i) {
            if (o.i === 9) {
                str += 'ix';
            } else if (o.i > 4) {
                str += 'v';
                o.i -= 5;
                for (var a = 0; a < o.i; a += 1) {
                    str += 'i';
                }
            } else if (o.i === 4) {
                str += 'iv';
            } else {
                for (var a = 0; a < o.i; a += 1) {
                    str += 'i';
                }
            }
        }
        return str;
    }

    app.draw_text = function(ctx, txt, x, y, dx, dy, c, roman) {
        var l;

        txt = txt + '';
        !dx ? dx = 0 : '';
        !dy ? dy = 0 : '';
        c ? c = txt.length * 8 * 6 * (roman ? 4 : 1) / 2 : c = 0;

        ctx.save();
        ctx.translate(app.round(x - c), app.round(y));

        for (var a = 0; a < txt.length; a += 1) {
            l = app.cv['f_' + txt[a] + (roman ? '_roman_big' : '')].cv;
            a > 0 ? ctx.translate(l.width + 6, 0) : '';
            ctx.drawImage(l, app.round(-dx / 2 + Math.random() * dx * 6), app.round(-dy / 2 + Math.random() * dy * 6));
        }

        ctx.restore();
    }

    app.draw_hud_msg = function(ctx, dx, dy) {
        if (app.msg.length > 0) {
            app.msg.forEach(function(elem, elem_id) {
                app.draw_text(ctx, elem, app.round(app.w / 2 - elem.length * 8 * 6 / 2), app.round(app.h / 8) + 12 + elem_id * 6 * 10, dx || 0, dy || 0);
            });
        }
    }

    app.reset_game_stngs = function() {
        app.tmr = 0;
        app.wave = 0;
        app.wave_tmr = 0;
        app.wave_break = false;
        app.shake = false;
        app.can_spawn = true;

        app.ckill = false;
        app.ckill_pts_buff = 0;
        app.ckill_count = 0;
        app.ckill_max_count = 0;
        app.ckill_max_pts = 0;

        app.achv = {
            crusher: [0, 0],
            feeder: [0, 0],
            grinder: [0, 0]
        };

        app.bot = [];
        app.bot_id = [];
        app.bot_track = {
            kill: [0, 0, 0, 0],
            spawn: [0, 0, 0, 0],
            alive: [0, 0, 0, 0],
            alive_count: 0
        };
        app.bot_types = [
            { skin: 'normal', dmg: 0, dx_max: 10, hp: 100 },
            { skin: 'green', dmg: 0.47, dx_max: 11, hp: 125 },
            { skin: 'red', dmg: 1.0, dx_max: 12, hp: 150 },
            { skin: 'blue', dmg: 1.50, dx_max: 13, hp: 175 }
        ];

        app.blood = [];
        app.blood_id = [];
        app.blood_buff = [];
        app.body_part = [];
        app.body_part_id = [];

        app.plr = new app.Plr();
        app.plr.x = app.w / 2;
        app.plr.y = app.h / 2;

        app.bot_chances = [];

    }

    app.update_hud_msg = function(msg) {
        if (msg !== '') {
            app.msg.push(msg);

            if (app.msg.length > 1) {
                app.msg.shift();
            }
        }

        clearTimeout(app.msg_tout);

        app.msg_tout = setTimeout(function() {
            if (app.msg.length > 0) {
                app.msg.shift();
                app.update_hud_msg('');
            }
        }, 3000);
    }

    app.draw_start_screen = function(ctx) {
        ctx.save();
        ctx.translate(0, app.h / 2 - 4 * 6);

        app.draw_text(ctx, 'press j to start', app.w / 2, 0, 0, 0, true, true);

        ctx.restore();
    }

    app.restart_game = function() {
        app.cv.noise.ctx.clearRect(0, 0, app.w, app.h);
        app.reset_game_stngs();
        app.game_state = 1;
    }

    app.draw_grab_plr = function(p) {
        app.plr.skin = p;
    }

    app.select_smr_m = function(x) {
        var ctx = app.cv.smr_m_ctx;

        x ? app.smr_hvr_x = !app.smr_hvr_x : app.smr_hvr_y = !app.smr_hvr_y;

        ctx.save();
        ctx.clearRect(0, 0, app.w, app.h);
        ctx.translate(0, app.h / 2 - 12 * 4);
        ctx.translate(app.w / 2 - 18 * 4, 0);

        app.draw_text(ctx, 'retry', 0, 0, 0, 0, app.smr_hvr_y && !app.smr_hvr_x ? true : false);
        app.draw_text(ctx, 'tweet', 18 * 4, 0, 0, 0, app.smr_hvr_y && app.smr_hvr_x ? true : false);

        ctx.restore();
    }

    app.draw_smr_m = function() {
        var ctx = app.cv.smr_m_ctx;

        ctx.save();
        ctx.clearRect(0, 0, app.w, app.h);
        ctx.translate(0, app.h / 2 - 12 * 4);
        ctx.translate(app.w / 2 - 18 * 4, 0);

        app.draw_text(ctx, 'retry', 0, 0, 0, 0, true);
        app.draw_text(ctx, 'tweet', 18 * 4, 0, 0, 0, false);

        ctx.restore();
    }

    app.gen_noise_frame = function(c) {
        var pat_cv = app.create_cv('pat_cv', 120, 120);
        var pat_ctx = pat_cv.ctx;
        var alpha;
        var color;

        for (var r = 0; r < pat_cv.cv.height; r += 6) {
            for (var c = 0; c < pat_cv.cv.width; c += 6) {
                if (Math.random() < 0.5) {
                    alpha = Math.random() / 2;
                    color = Math.round(Math.random() * 64);
                    pat_ctx.fillStyle = 'rgba(' + Math.round(Math.random() * 30) + ',' + Math.round(Math.random() * 30) + ',' + Math.round(Math.random() * 30) + ',' + alpha + ')';
                    pat_ctx.fillRect(c, r, 6, 6);
                }
            }
        }

        return pat_cv.cv.toDataURL();
    }

    app.grant_medal = function() {
        var str = 'you earned a medal';

        app.draw_text(app.cv.ctx, str, app.w / 2, app.h / 2);
        app.plr.frenzy ? str = 'frenzy' : str = 'medal';
        app.update_hud_msg(str);
        app.play_sfx('exp_1');
        app.update_hud_msg(str);
    }

    app.on_plr_die = function() {
        app.toggle_bool('game_state', 500, 2);
        app.play_sfx('game_over');
        app.draw_hud_msg(app.cv.ctx, 2, 2);
        app.draw_smr_m();
        app.plr.frenzy ? app.toggle_bool('game_state', 500, 2) : '';
    }

    app.Plr = function() {
        this.hp = 300;
        this.php = 300;
        this.x = 0;
        this.y = 0;
        this.w = 10;
        this.h = 16;
        this.dx = 0;
        this.dy = 0;
        this.dx_max = 9;
        this.sjump = false;
        this.can_jump = false;
        this.jump = false;
        this.is_grab = false;
        this.frenzy = false;
        this.frenzy_end = false;
        this.is_hvy = false;
        this.fuel = 0;
        this.fuel_max = 30;
        this.pad_coll = false;
        this.pad_touch = false;
        this.anim = 'player_idle_normal';
        this.anim_frame = 0;
        this.flenzy_frame = 0;
        this.phs = false;
        this.weapon = 0;
        this.is_attack = false;
        this.dir = false;
        this.sfx = 0;
        this.grab = 0;
        this.is_grab = false;
        this.wpn_switch_tout = 0;
        this.dmg_fn = app.url_params.gore === 1 ? 'explosive' : 'normal';

        this.update_pos = function() {
            this.x = this.x + this.dx * (this.frenzy ? 2.3 : 1);
            this.y = this.y + this.dy;
        }

        this.update_anim_frame = function(no) {
            no ? this.anim_frame = 0 : this.anim_frame = this.anim_frame + 1 === app.cv[this.anim].cv.width / this.w ? 0 : this.anim_frame + 1;
        }

        this.update_frenzy = function() {
            this.frenzy_frame = this.frenzy_frame + 1 > 6 ? 0 : this.frenzy_frame + 1;
        }

        this.move = function() {
            if (this.left) {
                this.dx = -this.dx_max;
            } else if (this.right) {
                this.dx = this.dx_max;
            } else {
                this.dx = 0;
            }

            this.dy < 10 ? this.dy += app.gravity : this.dy;
        }

        this.update_jump = function() {
            if (this.jump && this.can_jump) {
                this.dy = -10;
                this.can_jump = false;
                app.play_sfx('jump');
            } else {
                this.jump = false;
            }
        }

        this.update_grab = function() {
            this.is_grab === false && this.grab === 1 ? this.is_grab = true : '';
        }

        this.update_attack = function() {
            this.is_attack = true;
            this.wpn_switch_tout = 0;
        }

        this.update_hp = function() {
            if (this.hp < this.php) {
                this.hp += 1;
            } else if (this.hp > this.php) {
                this.hp -= 1;
            }
        }

        this.start_fall = function() {
            if (this.dy < 0 && !this.can_jump) {
                this.sjump = false;
            } else {
                this.sjump = true;
            }
        }

        this.lvl_pads_coll = function() {
            var i;
            var w;
            var h;
            var pads;
            var pad;
            var y_min;
            var x_max;
            var pad_vrt;

            pads = app.cv.lvl.cv.getImageData(this.x - this.w / 2, this.y, this.w * 2, this.h);

            for (i = 0; i < pads.data.length; i += 4) {
                if (pads.data[i + 3] > 0) {
                    this.dy = -2;
                    this.can_jump = true;
                } else if (pads.data[i] === 0) {
                    this.dy = 1;
                    this.can_jump = false;
                }
            }
        }

        this.lvl_bnds_coll = function() {
            this.y > app.h ? this.on_die() : '';
        }

        this.on_die = function() {
            app.play_sfx('die');
            app.on_plr_die();
        }

        this.bots_coll = function() {
            app.bot.forEach(function(bot) {
                var b = bot;
                var dx = b.x - this.x;
                var dy = b.y - this.y;
                var dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < this.w) {
                    this.hp -= b.dmg * (this.frenzy ? 1.5 : 1);
                    this.dy = -5;
                    this.dx = 5 * b.dir;
                    this.fuel = 0;
                    this.sjump = false;
                    b.dx = -b.dx;
                    b.dy = -b.dy;

                    if (this.hp <= 0) {
                        this.on_die();
                    }
                }
            }.bind(this));
        }

        this.update_phs = function() {
            if (this.phs) {app.bot.forEach(function(bot) {
                    var b = bot;
                    var dx = b.x - this.x;
                    var dy = b.y - this.y;
                    var dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < this.w) {
                        this.hp -= b.dmg * (this.frenzy ? 1.5 : 1);
                        this.dy = -5;
                        this.dx = 5 * b.dir;
                        this.fuel = 0;
                        this.sjump = false;
                        b.dx = -b.dx;
                        b.dy = -b.dy;

                        if (this.hp <= 0) {
                            this.on_die();
                        }
                    }
                }.bind(this));
            }
        }
    }

    app.Bot = function() {
        this.b_t = 0;
        this.hp = 100;
        this.php = 100;
        this.x = 0;
        this.y = 0;
        this.w = 10;
        this.h = 16;
        this.dx = 0;
        this.dy = 0;
        this.dx_max = 9;
        this.dhp = 0;
        this.dir = 0;
        this.anim = 'bot_walk_normal_1';
        this.anim_frame = 0;
        this.php = this.hp;
        this.dmg = 1.0;

        this.update_pos = function() {
            this.x = this.x + this.dx * 0.5;
            this.y = this.y + this.dy * 0.5;
        }

        this.update_anim_frame = function(no) {
            no ? this.anim_frame = 0 : this.anim_frame = this.anim_frame + 1 === app.cv[this.anim].cv.width / this.w ? 0 : this.anim_frame + 1;
        }

        this.move = function() {
            if (this.dir === 0) {
                this.dx = -this.dx_max;
            } else {
                this.dx = this.dx_max;
            }

            this.dy = 0;
        }

        this.lvl_pads_coll = function() {
            var i;
            var w;
            var h;
            var pads;
            var pad;
            var y_min;
            var x_max;
            var pad_vrt;

            pads = app.cv.lvl.cv.getImageData(this.x - this.w / 2, this.y, this.w * 2, this.h);

            for (i = 0; i < pads.data.length; i += 4) {
                if (pads.data[i + 3] > 0) {
                    this.dy = -2;
                }
            }
        }

        this.lvl_bnds_coll = function() {
            this.y > app.h ? this.on_die() : '';
        }

        this.on_die = function() {
            app.play_sfx('die');
            app.remove_obj(this);
        }

        this.update_phs = function() {
            app.bot.forEach(function(bot) {
                var b = bot;
                var dx = b.x - this.x;
                var dy = b.y - this.y;
                var dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < this.w) {
                    this.hp -= b.dmg;
                    this.dy = -5;
                    this.dx = 5 * b.dir;
                    this.fuel = 0;
                    this.sjump = false;
                    b.dx = -b.dx;
                    b.dy = -b.dy;

                    if (this.hp <= 0) {
                        this.on_die();
                    }
                }
            }.bind(this));
        }
    }

    app.init = function() {
        app.url_params = {};

        window.location.search.substring(1).split('&').forEach(function(param) {
            var parts = param.split('=');
            app.url_params[parts[0]] = parts[1];
        });

        app.w = 640;
        app.h = 480;

        app.create_cv('lvl', app.w, app.h, true, true);
        app.create_cv('frenzy_bg', app.w, app.h, true, true);
        app.create_cv('noise', app.w, app.h, true, true);
        app.create_cv('smr_m', app.w, app.h, true, true);

        app.init_cv('f', true, 48, 48, true, false);

        app.cv.lvl.ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        app.cv.lvl.ctx.fillRect(0, 0, app.w, app.h);

        app.cv.ctx = app.cv.lvl.ctx;
        app.cvs = app.cv.lvl.cv;

        app.plr = new app.Plr();
        app.plr.x = app.w / 2;
        app.plr.y = app.h / 2;

        app.bot = [];
        app.bot_id = [];
        app.bot_types = [
            { skin: 'normal', dmg: 0, dx_max: 10, hp: 100 },
            { skin: 'green', dmg: 0.47, dx_max: 11, hp: 125 },
            { skin: 'red', dmg: 1.0, dx_max: 12, hp: 150 },
            { skin: 'blue', dmg: 1.50, dx_max: 13, hp: 175 }
        ];

        app.bot_track = {
            kill: [0, 0, 0, 0],
            spawn: [0, 0, 0, 0],
            alive: [0, 0, 0, 0],
            alive_count: 0
        };

        app.blood = [];
        app.blood_id = [];
        app.body_part = [];
        app.body_part_id = [];
        app.msg = [];
        app.msg_tout = 0;

        app.toggle_bool('game_state', 500, 0);
        app.reset_game_stngs();
        app.update_hud_msg('');
        app.init_frnz_assets();
        app.init_noise();
        app.on_wave_start();

        app.fps = 0;
        app.last_fps = 0;
        app.fps_tout = setInterval(app.fps_tout_fn, 1000);

        setInterval(app.update, 1000 / 30);
        setInterval(function() {
            app.draw_noise(app.cv.noise.ctx);
        }, 1000 / 30);

        app.draw_start_screen(app.cv.ctx);

        document.addEventListener('keydown', function(event) {
            switch (event.key) {
                case 'a':
                    app.plr.left = true;
                    break;
                case 'd':
                    app.plr.right = true;
                    break;
                case 'w':
                    app.plr.jump = true;
                    break;
                case 's':
                    app.plr.down = true;
                    break;
                case ' ':
                    app.plr.attack = true;
                    break;
                case 'j':
                    if (app.game_state === 0) {
                        app.restart_game();
                    }
                    break;
            }
        });

        document.addEventListener('keyup', function(event) {
            switch (event.key) {
                case 'a':
                    app.plr.left = false;
                    break;
                case 'd':
                    app.plr.right = false;
                    break;
                case 'w':
                    app.plr.jump = false;
                    break;
                case 's':
                    app.plr.down = false;
                    break;
                case ' ':
                    app.plr.attack = false;
                    break;
            }
        });
    };

    app.init();
};
