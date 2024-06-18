// Data
var subjects = [
    { name: "Video Game" },       // 0
    { name: "Books" },            // 1
    { name: "TV" },               // 2
    { name: "Drinks" },           // 3
    { name: "Technology" },       // 4
    { name: "Fitness" },          // 5
    { name: "Science" },          // 6
    { name: "Politics" },         // 7
    { name: "Pets" },             // 8
];

var traits = [
    // s: subject, d: direction, t: text
    { s: 0, d: 2, o: 1, t: "Playing videogames." },
    { s: 0, d: 2, o: 1, t: "Still in love with my Super Nintendo." },
    { s: 0, d: 0, o: 4, t: "Not into games." },

    { s: 1, d: 2, o: 1, t: "Like Books, comic books and graphic novels." },
    { s: 1, d: 2, o: 1, t: "Poetry." },
    { s: 1, d: 2, o: 1, t: "Love reading." },
    { s: 1, d: 0, o: 1, t: "Books are the old media." },
    { s: 1, d: 0, o: 4, t: "I don't read books, come on, it's the 90's!" },

    { s: 2, d: 2, o: 2, t: "I love soap operas." },
    { s: 2, d: 0, o: 5, t: "I hate TV." },
    
    { s: 3, d: 2, o: 1, t: "Uh, I love beer!" },
    { s: 3, d: 2, o: 5, t: "Maybe we can go out for a beer?" },
    { s: 3, d: 2, o: 0, t: "Love me some wine." },
    { s: 3, d: 0, o: 3, t: "If you're wondering, I don't drink." },
    { s: 3, d: 0, o: 3, t: "No alcohol for me." },
    { s: 3, d: 0, o: 3, t: "No drinking." },

    { s: 4, d: 2, o: 0, t: "I write computer programs." },
    { s: 4, d: 2, o: 0, t: "I speak C++." },
    { s: 4, d: 2, o: 0, t: "This Internet thing is promising." },
    { s: 4, d: 0, o: 0, t: "I'm not a tech person." },
    { s: 4, d: 0, o: 0, t: "I don't understand this internet." },

    { s: 5, d: 2, o: 3, t: "Jogging." },
    { s: 5, d: 2, o: 3, t: "Play basketball." },
    { s: 5, d: 0, o: 5, t: "High five sedentary people!" },
    { s: 5, d: 0, o: 3, t: "No sports." },

    { s: 6, d: 2, o: 1, t: "Hail Carl Sagan!" },
    { s: 6, d: 0, o: 0, t: "God in first place." },

    { s: 7, d: 0, o: 3, t: "Capitalism and Conservadorism." },
    { s: 7, d: 0, o: 0, t: "Right-winged person." },
    { s: 7, d: 2, o: 5, t: "Have you read some Karl Marx?" },
    { s: 7, d: 2, o: 2, t: "Communism, socialism, and anarchism." },

    { s: 8, d: 2, o: 3, t: "Totally a cat person." },
    { s: 8, d: 2, o: 3, t: "I have a kitten." },
    { s: 8, d: 0, o: 3, t: "Dog person here." },
    { s: 8, d: 0, o: 5, t: "Love puppies!" },
];

var female_names = ["Joanna", "Linda", "Lorenna", "Alyssa", "Anna", "Anne", "Eduarda", "Kat", "Giuliana", "Lais", "Adrianne", "Gal", "Olivia", "Nicole", "Lianna", "Laura", "Emma", "Chloe"];
var male_names = ["Bruno", "John", "Marcus", "Jay", "Rodrigo", "Anderson", "Val", "Germano", "George", "Mamoru", "Ed", "Felipe", "Klev", "Beto", "Frank", "Daniel", "Karl", "Simon", "Leo"];
var last_names = ["Smith", "Silva", "Johnson", "Kim", "Cruz", "Lee", "Yamada", "Kilmer", "Lopes", "Miya", "Drake", "Lira", "Love", "Lake", "Romero", "Stark", "Muller", "Mayer", "Laurent"];

var sex_orient = [ 
    { w: 0.60, t: "Straight" },       // 0
    { w: 0.25, t: "Homosexual" },     // 1
    { w: 0.15, t: "Bisexual" },       // 2
];

var week_total = 5;
var week_price = 10;
var week_price_increase = 5;
var dismiss_price = 20;
var dismiss_price_increase = 5;

var texts = {
    date_conf: "<p>Do you want to match <b>$1</b> and <b>$2</b>?</p><p>After their date ends you will get a date report.</p>",
    date_end: "<p>Seems like the date between <b>$1</b> and <b>$2</b> finished. Date result: <span class=\"$3\">$4</span></p>",
    week_started: "<p>Week <b>$1</b> just started. You need to match <b>$2</b> people this week.</p>",
    welcome_help: "<div class=\"inner-object results-box\"><p>Phosphorus Dating is a very modern dating website, our matching algorithm was considered one of the most advanced ever created. We achieved more than <b>90%</b> of successful couples. But recently something happened and for some reason the accuracy is below <b>25%</b>, this is why we activated the manual mode and you're here.</p><p>You have <b>" + week_total + "</b> weeks, until our system is fixed, to match couples based on their <b>gender</b>, <b>sexual orientation</b>, <b>age</b> and <b>interests</b>. Every week you will have to find a good couple for the people in the left list of the Phosphorus Dating program. Pick the right person on the right and match the couple. If you can't find a good match, you can dismiss anybody on the right list, but it uses <b>Hearts &#10084;</b>, which you only get when you make a successful couple. You will also need <b>Hearts &#10084;</b> to go to the next week.</p><p>When you match a couple, they will go out on a date and you can keep up with the progress on the lower left date list on the program. After that finishes you'll get a report.</p></div>",
    finish: "You finished the period with <b>$1%</b>.",
    finish_good: "That's remarkable! Congratulations. We will have to boost our algorithm to keep up with that mark.",
    finish_ok: "Good job. We hope our algorithm is finally fixed.",
    finish_bad: "That wasn't as good as we initially thought, but better than using a broken algorithm. Thanks for the effort.",
    finish_glitch: "That's A̶̦̒A̴a̽a̳̾A̶͖A̎͊A̿a͚͉͠A͠A̋a̦̩ã̷̸AͣA̳ͤ́A̩̥Ä̵́ͅ0͆0̋0̷̸̋f̰a̷͕͒ c͙͗f͑ b̡̕c͓̟̓ 0̵̇͡3͎̞͘ 0̞͑1̯̗͜ 2̲3ͧc͔5̴̞̥ AD",
    week_next: "Next week ($1 &#10084;)",
    not_enough_hearts: "<p>You finished the week with <b>$1 &#10084;</b>; and needed <b>$2 &#10084;</b> to go to the next one.<p>",
    dismiss_button: "Dismiss ($1 &#10084;)",
    dismiss_conf: "<p>If you dismiss <b>$1</b> another person will take its place. It will cost you <b>$2 &#10084;</b>. Do you want to do that?</p>",
    dismiss_not: "<p>You can't dismiss <b>$1</b>, because you don't have <b>$2 &#10084;</b>.</p>",
};

var match_category = [
    { score: 90, title: "Marriage", text: "Wow! They really got along very well. Don't be surprise if you get a marriage invite soon." },
    { score: 65, title: "Love", text: "Amazing date! After that, they went to a motel, had a lot of fun and already set another date for the next week." },
    { score: 45, title: "Passion", text: "They're kind of addicted to each other. Other dates are coming, maybe travel together?" },
    { score: 20, title: "Casual Sex", text: "They had a good sex after the date, but they don't seem like they will go out together any more. Call it a good time." },
    { score: 0, title: "Nice Buddies", text: "They enjoyed conversation together, but doesn't seem like they're going to do anything else. Maybe good friends." },
    { score: -100, title: "Strangers", text: "Weird \"date\" (if one can call that way). Unconfortable talking with a total stranger. That shall not happen ever again." },
    { score: -150, title: "Awkward", text: "The most awkward event in their lives. They're going to forget that forever." },
    { score: -250, title: "Fight", text: "Oh my Dog! There was a fight over there! They don't even want to see each other's face in the streets! That's awful." }
];


// Util
var gId = function(t) { return document.getElementById(t); };

Array.prototype.rand = function() {
    return this[Math.floor((Math.random() * this.length))];
};

Array.prototype.group = function(keyFunction) {
    var groups = {};
    this.forEach(function(el) {
        var key = keyFunction(el);
        if (!(key in groups)) {
            groups[key] = [];
        }
        groups[key].push(el);
    });
    return Object.keys(groups).map(function(key) {
        return {
            key: key,
            values: groups[key]
        };
    });
};

Array.prototype.unique = function() {
    return this.reduce(function(accum, current) {
        if (accum.indexOf(current) < 0) {
            accum.push(current);
        }
        return accum;
    }, []);
};

var rangeRand = function (min, max) {
    return min + Math.floor((Math.random() * (max - min + 1)));
};

var weightRand = function(arr) {
    var i = Math.random();
    var t = 0;

    for (var j = 0; j < arr.length; j++)
    {
        t += arr[j].w;
        if (i < t) return arr[j].t;
    }
};

var getOrientIndex = function(t) {
    for (var j = 0; j < sex_orient.length; j++)
    {
        if (sex_orient[j].t == t) {
            return j;
        }
    }
};

var getTraitsExcept = function(exception) {
    var ts = [];
    traits.forEach(function(t) {
        for(var i = 0; i < exception.length; i++) {
            if (t.s == exception[i].s) {
                return;
            }
        }
        ts.push(t);
    });

    return ts;
};

// Cecilia

var cecilia_dent = {
    gender: 0,
    orientation: "Straight",
    sex_orient: 0,
    name: "Cecilia Dent",
    age: 22,
    traits: [{s: 0, d: 2}, {s: 1, d: 2}, {s: 4, d: 2}, {s: 6, d: 2}],
    bio: "Scientist interested in Time Travel. I want to have two children, a boy Arthur and a girl Cecilia, why only men can name their children after themselves?"
};

// Person
var Person = function () {
    // Gender
    this.gender = rangeRand(0, 1);

    // Sexual orientation
    this.orientation = weightRand(sex_orient);
    this.sex_orient = getOrientIndex(this.orientation);

    // Name
    if (this.gender == 0) this.name = female_names.rand() + " " + last_names.rand();
    else this.name = male_names.rand() + " " + last_names.rand();

    // Age
    var max = 30;
    if (rangeRand(0, 100) > 65) max = 52;
    this.age = rangeRand(18, max);

    // Trais
    this.traits = [];
    this.bio = "";
    var amount = rangeRand(3, 5);
    for (var i = 0; i < amount; i++) {
        var t = getTraitsExcept(this.traits).rand();
        this.traits.push(t);
    }

    this.traits.sort(function(a, b) { return a.o - b.o; });
    this.traits.forEach(function(t) {
        this.bio += t.t + " ";
        if (rangeRand(1,100) > 90) {
            this.bio += "<br><br>";
        }
    }, this);

    // Upper/Lower case modifier
    var bioModifier = rangeRand(0, 100);
    if (bioModifier > 85) {
        this.bio = this.bio.toLowerCase();
    } else if (bioModifier > 80) {
        this.bio = this.bio.toUpperCase();
    }

    // Ponctuation modifier
    bioModifier = rangeRand(0, 100);
    if (bioModifier > 70) {
        this.bio = this.bio.replace(/,/g, "").replace(/\./g, ",");
        this.bio = this.bio.substr(0, this.bio.length - 2);
    }

    // Emo modifier
    bioModifier = rangeRand(0, 100);
    if (bioModifier > 97) {
        this.bio = [].map.call(this.bio, function(e) {
            return rangeRand(0, 1) == 0 ? e.toUpperCase() : e.toLowerCase();
        }).join("");
    }
};

// Matches
var match_ids = 0;
var Match = function(p1, p2) {
    this.id = match_ids++;
    this.p1 = p1;
    this.p2 = p2;
    this.value = 0;

    this.calculate = function() {
        this.sex = 0;
        var good = 20;
        var bad = -100;

        // Gender and Sexual orientation
        if (p1.sex_orient == 2 && p2.sex_orient == 2) {
            this.sex += good;
        } else if (p1.sex_orient === 0 && p2.sex_orient === 0) {
            this.sex += p1.gender != p2.gender ? good : bad;
        } else if (p1.sex_orient === 1 && p2.sex_orient === 1) {
            this.sex += p1.gender == p2.gender ? good : bad;
        } else if (p1.sex_orient === 0 || p2.sex_orient === 0) {
            if (p1.sex_orient == 2 || p2.sex_orient == 2) {
                this.sex += Math.floor(p1.gender != p2.gender ? good : bad);
            } else if (p1.sex_orient === 1 || p2.sex_orient === 1) {
                this.sex += bad;
            } 
        } else if (p1.sex_orient === 1 || p2.sex_orient === 1) {
            if (p1.sex_orient === 2 || p2.sex_orient === 2) {
                this.sex += Math.floor(p1.gender == p2.gender ? good : bad);
            } else if (p1.sex_orient === 0 || p2.sex_orient === 0) {
                this.sex += bad;
            } 
        }

        // Traits
        this.positive = 0;
        this.neutral = 0;
        this.negative = 0;

        var tts = function(t) { return t.s; };
        var tr1sub = this.p1.traits.map(tts);
        var tr2sub = this.p2.traits.map(tts);

        var intersection = this.p1.traits.filter(function(t) { return tr2sub.indexOf(t.s) >= 0; }).concat(
                           this.p2.traits.filter(function(t) { return tr1sub.indexOf(t.s) >= 0; }));
        
        var tr1f = this.p1.traits.filter(function (t) { return intersection.map(tts).indexOf(t.s) == -1; });
        var tr2f = this.p2.traits.filter(function (t) { return intersection.map(tts).indexOf(t.s) == -1; });

        var ig = intersection.group(tts);
        ig.forEach(function(e) {
            var sum = e.values.reduce(function(acc, v) {
                return acc + v.d;
            }, 0) - 2;

            if (sum === 0) {
                this.negative++;
            } else {
                this.positive++;
            }
        }, this);

        this.neutral = tr1f.length + tr2f.length;

        this.subjects = this.p1.traits.concat(this.p2.traits).map(function (t) { return subjects[t.s]; }).unique();

        // Traits and Sex info
        this.total = this.sex + (this.negative * -30) + (this.positive * 30);
        var neutral_score = (this.neutral * 10);
        var neutral_range = rangeRand((neutral_score / -2), (neutral_score / 2));
        // Still thinking if I should let this...
        //this.total += neutral_range;

        // Age info
        var ageabs = Math.abs(this.p1.age - this.p2.age);
        this.age_penalizing = Math.floor(ageabs / 10) * 7;
        this.total -= rangeRand(0, this.age_penalizing);

        // Category
        this.category = this.getCategory();

        // Step speed
        var seconds = (this.subjects.length * 2) + (this.positive * 4);
        if (this.sex < 0) {
            seconds = seconds / 1.8;
        }
        this.step = 100 / (seconds * 100);

        this.score = this.total > 0 ? Math.floor(this.total / 2) : 0;
        console.log(this);
    };

    this.getCategory = function () {
        var i;
        for (i in match_category) {
            if (this.total >= match_category[i].score) {
                return i;
            }
        }
    };

    this.createProgressItem = function() {
        var ml = gId("matchItemTemplate");
        this.dl = gId("dateList");

        var names = this.p1.name + " & " + this.p2.name;
        var c = ml.innerHTML.replace("$1", names).replace("$2", this.id);

        this.li = document.createElement("li");
        this.li.innerHTML = c;
        this.dl.appendChild(this.li);

        this.progress = gId("matchProgress-" + this.id);

        this.interval = setInterval(this.updateBar.bind(this), 10);
    };

    this.updateBar = function() {
        this.value += this.step;
        this.progress.value = this.value;

        if (this.value >= 100) {
            this.endOfMatch();
        }
    };

    this.endOfMatch = function() {
        clearInterval(this.interval);

        var cat = match_category[this.category];
        var cls = this.total > 0 ? "results-good" : "results-bad";

        var mtext = texts.date_end.
                        replace("$1", this.p1.name).
                        replace("$2", this.p2.name).
                        replace("$3", cls).
                        replace("$4", cat.title);

        mtext += '<div class="inner-object results-box"><p>' + cat.text + '</p>';
        mtext += '<p>They talked about:</p>';
        mtext += '<ul>';

        var divider = this.total > 0 ? 1 : 2;

        for (var i = 0; i < this.subjects.length / divider; i++) {
            mtext += '<li>' + this.subjects[i].name + '</li>';
        }

        mtext += '</ul>';
        mtext += '<p>Hearts &#10084; earned <b>' + this.score + '</b>.</p>';
        mtext += '</div>';
        showDialogOk("Date finished: " + cat.title, mtext, this.killCurrentMatch.bind(this));
    };

    this.killCurrentMatch = function() {
        this.dl.removeChild(this.li);
        if (this.finished) {
            this.finished(this);
            this.finished = null;
        }
    };

    this.calculate();
    this.createProgressItem();
};

// Templates
function peopleListTemplate(l, id, name) {
    var t = gId("peopleListTemplate");
    return t.innerHTML.replace("$1", l).replace("$2", id).replace("$3", name);
}

function peopleDetail(person) {
    if (person === null)
    {
        return "";
    }

    var t = gId("peopleDetail");
    var s = (person.gender === 0 ? "Female" : "Male") + " - " + person.orientation;
    
    var elem = t.innerHTML.replace("$1", person.name + ", " + person.age).replace("$2", s).replace("$3", person.bio);
    return elem;
}

// Dialog System
var dialog = { 
    bg: gId("dialogDiv"), 
    dw: gId("dialogWindow"),
    title: gId("dialogTitle"),
    section: gId("dialogSection"),
    ok: gId("dialogOk"),
    cancel: gId("dialogCancel"),
    hide: function() { 
        this.bg.style = "visibility: hidden";
        this.dw.style = "visibility: hidden";
        this.active = false;

        setTimeout(this.checkQueue.bind(this), 100);
    },
    show: function() {
        this.bg.style = "visibility: visible";
        this.dw.style = "visibility: visible";
        this.active = true;
    },
    onOk: null,
    okCancel: null,
    checkQueue: function() {
        if (this.dialogQueue.length > 0) {
            var d = this.dialogQueue.pop();
            createDialogOk(d.title, d.section, d.okCallback, d.cancel);
        }
    },
    addResults: function() {
        this.dw.className += " results";
    },
    removeResults: function() {
        this.dw.className = this.dw.className.replace(/ results/, '');
    },
    showCancel: function() {
        this.cancel.className = this.cancel.className.replace(/ hidden/g, '');
    },
    hideCancel: function() {
        this.cancel.className += " hidden";
    },
    active: false,
    dialogQueue: [] 
};

var showDialogOk = function(title, section, okCallback, cancel) {
    if (dialog.active) {
        dialog.dialogQueue.push({ title: title, section: section, okCallback: okCallback, cancel: cancel });
    } else {
        createDialogOk(title, section, okCallback, cancel);
    }
};

var createDialogOk = function(title, section, okCallback, cancel) {
    dialog.hideCancel();

    if (cancel) {
        dialog.showCancel();
    }

    dialog.title.innerHTML = title;
    dialog.section.innerHTML = section;
    dialog.onOk = function () {
        dialog.hide();
        if (okCallback) {
            okCallback();
        }
    };
    dialog.onCancel = function () {
        dialog.hide();
    };
    dialog.show();
};

// Console
var GameConsole = function() {
    this.consoleDiv = gId("consoleDiv");
    this.consoleFix = document.querySelector("#consoleDiv .console-fix");
    this.consolePre = document.querySelector("#consoleDiv pre");

    this.keyPressed = function(k) {
        if (this.key) {
            this.nextToken();
        }

        return;
    };

    this.init = function(text, callback, options) {
        this.callback = callback;

        if (options && options == "error") {
            this.consoleDiv.className += " error";
        } else {
            this.consoleDiv.className = this.consoleDiv.className.replace(/ error/g, '');
        }

        this.consolePre.innerHTML = "";

        var date = new Date();
        var m = date.getMonth() + 1;
        var y = date.getFullYear();
        if (m < 10) m = "0" + m;

        var txt = text;
        txt = txt.replace(/\$m/g, m).replace(/\$y/g, y);
        this.tokens = txt.split("%c");
        this.currentToken = 0;
        
        this.key = false;
        document.onkeypress = this.keyPressed.bind(this);

        this.show();
        this.nextToken();
    };

    this.nextToken = function() {
        this.key = false;

        this.consolePre.innerHTML = this.consolePre.innerHTML.substr(0, this.consolePre.innerHTML.length - 1);
        this.consolePre.innerHTML += this.tokens[this.currentToken];
        this.consolePre.innerHTML += "_";
        this.consoleFix.scrollTop = this.consoleFix.scrollHeight; 
        
        this.currentToken++;

        if (this.currentToken < this.tokens.length) {
            if (this.tokens[this.currentToken].indexOf("%k") > -1) {
                this.key = true;
            } else if (this.tokens[this.currentToken].indexOf("%l")  > -1) {
                this.timeout = setTimeout(this.nextToken.bind(this), 2000);
            } else if (this.tokens[this.currentToken].indexOf("%s")  > -1) {
                this.timeout = setTimeout(this.nextToken.bind(this), 700);
            }
            
            this.tokens[this.currentToken] = this.tokens[this.currentToken].replace(/%[a-z]/g, "");
        } else {
            if (this.callback) {
                this.callback();
            }
        }
    };

    this.hide = function() {
        this.consolePre.innerHTML = "";
        this.consoleDiv.className += " hidden";
        document.onkeypress = null;
        clearInterval(this.timeout);
    };

    this.show = function() {
        this.consoleDiv.className = this.consoleDiv.className.replace(/hidden/g, '');
        this.consolePre.className = this.consolePre.className.replace(/hidden/g, '');
        
        this.consoleDiv.focus();
    };
};


// Game
var Game = function() {
    this.matches = [];
    this.week = 0;

    this.totalMatches = 0;
    this.totalGoodMatches = 0;
    this.totalScore = 0;

    this.currentPeople = [0, 0];

    this.dismissPrice = dismiss_price;
    this.weekPrice = week_price;
    this.maxPeople = 8;

    // DOM elements
    this.dateWeek = gId("dateWeek");
    this.dateLeft = gId("dateLeft");
    this.dateCouples = gId("dateCouples");
    this.dateRating = gId("dateRating");
    this.dateScore = gId("dateScore");
    this.dateBonus = gId("dateBonus");
    
    this.nextWeekButton = gId("nextWeek");
    this.dismissButton = gId("dismissButton");

    this.start = function () {
        var txt = "<p>Welcome to <b>Phosphorus Dating</b>. You are logged in as <span style=\"color: green\">cecilia.dent</span>.</p>";
        txt += texts.welcome_help;
        showDialogOk("Welcome", txt);
        this.randomPeople();
        this.startWeek();
    };

    this.help = function() {
        showDialogOk("Help", texts.welcome_help);
    };

    this.startWeek = function() {
        this.week++;

        if (this.week > week_total) {
            this.endOfGame();
            return;
        }

        this.goodWeekMatches = 0;
        this.finishedMatches = [];

        this.startWeekPeople();
        this.addWeekPeople();

        this.drawPeople();
        this.renderDetails();
        this.updateDateData();

        this.nextWeekButton.innerHTML = "<span>" + texts.week_next.replace("$1", this.weekPrice) + "</span>";
        this.dismissButton.innerHTML = "<span>" + texts.dismiss_button.replace("$1", this.dismissPrice) + "</span>";
        this.nextWeekButton.className += " disabled";

        var txt = texts.week_started.replace("$1", this.week).replace("$2", this.opeople.length);
        showDialogOk("Week", txt);
    };

    this.startWeekPeople = function() {
        this.opeople = [];
        var a = 3 + Math.floor((this.week) / 3);
        for (var i = 0; i < a; i++) {
            var p = new Person();
            this.opeople.push(p);
        }

        if (this.week == week_total) {
            this.opeople.push(cecilia_dent);
        }

        this.currentPeople[0] = this.opeople[0];
    };

    this.randomPeople = function() {
        this.people = [];
        for (var i = 0; i < 7; i++)
        {
            var p = new Person();
            this.people.push(p);
        }
    };

    this.addWeekPeople = function() {
        var newPeople = (this.maxPeople - this.people.length) + Math.floor((this.week) / 2);
        for (var i = 0; i < newPeople; i++)
        {
            var p = new Person();
            this.people.push(p);
        }

        this.currentPeople[1] = this.people[0];
    };

    this.updateDateData = function() {
        var rating = 'N/A';
        if (this.totalMatches > 0) {
            rating = Math.floor(this.totalGoodMatches / this.totalMatches * 100);
            rating = '' + rating + '%';
        }

        this.dateWeek.innerHTML = this.week + ' / ' + week_total;
        this.dateLeft.innerHTML = this.opeople.length;
        this.dateCouples.innerHTML = this.goodWeekMatches + ' / ' + this.finishedMatches.length;
        this.dateRating.innerHTML = rating;
        this.dateScore.innerHTML = this.totalScore;
    };

    this.drawPeople = function() {
        var p1 = gId("peopleList1");
        var p2 = gId("peopleList2");

        p1.innerHTML = p2.innerHTML = "";

        var id = 0;
        this.opeople.forEach(function(p) {
            p1.innerHTML += peopleListTemplate(0, id, p.name);
            id++; 
        });
        id = 0;
        this.people.forEach(function(p) {
            p2.innerHTML += peopleListTemplate(1, id, p.name);
            id++; 
        });
    };

    this.clickPerson = function(l, id) {
        this.currentPeople[l] = l === 0 ? this.opeople[id] : this.people[id];
        this.renderDetails(l);
    };

    this.renderDetails = function() {
        var p1 = gId("personDescription1");
        var p2 = gId("personDescription2");

        p1.innerHTML = peopleDetail(this.currentPeople[0]);
        p2.innerHTML = peopleDetail(this.currentPeople[1]);
    };

    this.dismiss = function() {
        if (this.totalScore >= this.dismissPrice) {
            var msg = texts.dismiss_conf.replace("$1", this.currentPeople[1].name).replace("$2", this.dismissPrice);
            showDialogOk("Dismiss", msg, this.dismissPerson.bind(this), "cancel");
        } else {
            showDialogOk("Dismiss", texts.dismiss_not.replace("$1", this.currentPeople[1].name).replace("$2", this.dismissPrice));
        }
    };

    this.dismissPerson = function() {
        this.people.splice(this.people.indexOf(this.currentPeople[1]), 1);

        var p = new Person();
        this.people.push(p);

        this.currentPeople[1] = this.people[this.people.length-1];

        this.totalScore -= this.dismissPrice;
        this.dismissPrice += dismiss_price_increase;
        this.dismissButton.innerHTML = "<span>" + texts.dismiss_button.replace("$1", this.dismissPrice) + "</span>";
        
        this.drawPeople();
        this.renderDetails();
        this.updateDateData();
    };

    this.nextWeek = function() {
        if (this.opeople.length == 0 && this.matches == 0) {
            this.totalScore -= this.weekPrice;
            this.weekPrice += week_price_increase;
            this.finishWeek();
        }
    };

    this.match = function() {
        var p1 = this.currentPeople[0];
        var p2 = this.currentPeople[1];

        if (p1 === null || p2 === null) {
            showDialogOk("Oops", "<p>There's no one else to match right now.</p>");
        } else {
            showDialogOk("Do a Match?", 
                        texts.date_conf.replace("$1", p1.name).replace("$2", p2.name),
                        this.doMatch.bind(this, p1, p2), true);
        }

    };

    this.doMatch = function(p1, p2) {
        this.opeople.splice(this.opeople.indexOf(p1), 1);
        this.people.splice(this.people.indexOf(p2), 1);
        
        if (this.opeople.length > 0) {
            this.currentPeople[0] = this.opeople[0];
        } else {
            this.currentPeople[0] = null;
        }
        this.currentPeople[1] = this.people[0];

        this.drawPeople();
        this.renderDetails();

        var m = new Match(p1, p2);
        m.finished = this.finishedMatch.bind(this);

        if (p1 == cecilia_dent || p2 == cecilia_dent) {
            this.ceciliaMatch = m;
        }

        this.matches.push(m);
    };

    this.finishedMatch = function(m) {
        this.matches.splice(this.matches.indexOf(m), 1);
        this.finishedMatches.push(m);

        if (m.total > 0) {
            this.totalGoodMatches++;
            this.goodWeekMatches++;
        }

        this.totalMatches++;

        this.totalScore += m.score;

        this.updateDateData();

        console.log(this);

        if (this.opeople.length == 0 && this.matches == 0) {
            if (this.totalScore >= week_price) {
                this.nextWeekButton.className = this.nextWeekButton.className.replace(/ disabled/g, '');
            } else {
                var msg = texts.not_enough_hearts.replace("$1", this.totalScore).replace("$2", this.weekPrice);
                showDialogOk("Not enough hearts", msg, function() {
                    gameConsole.init(gId("consoleEndOfGameNotEnoughHearts").innerHTML, function() {
                        location.reload();
                    });
                });
            }
        }
    };

    this.finishWeek = function () {
        var mtext = "<p>Week <b>" + this.week + "</b> has finished.</p>";
        mtext += '<div class="inner-object results-box"><p>These are the reports for this week. You matched <b>';
        mtext += this.finishedMatches.length + '</b> couples, which <b>' + this.goodWeekMatches;
        mtext += '</b> of them were successful:</p>';
        mtext += '<ul>';

        for (var i = 0; i < this.finishedMatches.length; i++) {
            var cat = match_category[this.finishedMatches[i].category];
            var cls = this.finishedMatches[i].total > 0 ? "results-good" : "results-bad";
            mtext += '<li>';
            mtext += this.finishedMatches[i].p1.name;
            mtext += ' & '; 
            mtext += this.finishedMatches[i].p2.name;
            mtext += ': ';
            mtext += '<span class="' + cls + '"><b>' + cat.title + '</b></span>';
            mtext += '</li>';
        }

        var score = this.finishedMatches.reduce(function(acc, cur) {
            return acc + cur.score;
        }, 0);

        mtext += '</ul>';
        mtext += '<p>You scored <b>' + score + '</b> points this week.</p>';
        mtext += '<p>Get ready for next week.</p>';
        mtext += '</div>';

        showDialogOk("Week Report", mtext, this.startWeek.bind(this));
    };

    this.endOfGame = function() {
        var rating = 'N/A';
        if (this.totalMatches > 0) {
            rating = Math.floor(this.totalGoodMatches / this.totalMatches * 100);
        }

        var msg = texts.finish.replace("$1", rating);

        if (this.ceciliaMatch && this.ceciliaMatch.total > 0) {

            if (rating >= 90) {
                msg += " " + texts.finish_good; 
            } else if (rating >= 65) {
                msg += " " + texts.finish_ok; 
            } else {
                msg += " " + texts.finish_bad; 
            }

            showDialogOk("Finished", msg, function() {
                gameConsole.init(gId("consoleEndOfGameSuccess").innerHTML, function() {
                    location.reload();
                });
            });
        } else {
            msg += " " + texts.finish_glitch;
            showDialogOk("Finished", msg, function() {
                gameConsole.init(gId("consoleError").innerHTML, function() { 
                    gameConsole.hide(); 
                    gameConsole.init(gId("consoleEndOfGameFail").innerHTML, function() {
                        location.reload();
                    });
                }, "error");
            });
        }
    };
};

var game = new Game();
var gameConsole = new GameConsole();
gameConsole.init(gId("consoleStart").innerHTML, function() { gameConsole.hide(); });
// gameConsole.hide();

(function() {
    game.start();
})();

