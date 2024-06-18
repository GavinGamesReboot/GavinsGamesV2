/** class for ranged enemies (wisps) **/

function _13ActorRanged(_world, bName, bW, bH) {
	
	var _auraProps = {
		grav: -0.5,
		lifespan: 600,
		freq: 60,
		on: true,
		fx: { scale: 1, alpha: 1 }
	}
	
	var _aura = _13Particles(_world, 'aura_' + bName, 10);	
	_13ObjExtend(_aura, _auraProps);
	
	_aura.rnd.pos = [ 5, 5 ]
	_aura.rnd.vel[1] = 10;

	// it has no texture, just particles
	var _retObj = _13Actor(_world, bName, bW, bH, 'ranged');
	_aura.link = _retObj;
	
	_13Each(_retObj.bullets, function(_cbul) {
		_cbul.w = 20;
		_cbul.h = 20;
		
		var _aura = _13Particles(_world, 'aura_bullet_' + bName, 5);	
		_13ObjExtend(_aura, _auraProps);
		_aura.lifespan = 300;
		_aura.rnd.vel[1] = 50;
	
		_aura.link = _cbul;
	})
	
	var _atkTime = 2200;
	
	return _13ObjExtend(_retObj, {
		w: 60,
		h: 60,
		grav: 0,
		collide: 'bullet_player',
		action: {
			move: null,
			watch: [0, 0],
			attack: false
		},
		didatk: 0,
		onDie: function() {
		},
		afterUpdate: function(timePassed) {
			var _act = this.action;
			var _this = this;
			
			this.facing = _act.watch[0] > 0;
			
			var _wdir = Math.atan2(_act.watch[1], _act.watch[0]);
			
			this.didatk -= timePassed;
			
			 // MOVING
			var _maxSpeed = 1000 * this.revmult;
			
			_13Rep(2, function(i) {
				if(_act.move != null && Math.abs(_this.vel[i]) < _maxSpeed) 
					_this.acc[i] = timePassed * _this.revmult * 0.15 * (_act.move[i] - _this.pos[i] - _this.vel[i] / 2);
				else {
					_this.acc[i] = 0;
					_this.vel[i] *= 0.99;
				}
			});

			this.alpha = 1 - _13Min(this.level, _13Dist(this.vel, [0, 0]) / 600); // fade effect on wisp 2
			
			if(this.didatk <= 0 && _act.attack)
			{
				this.didatk = _atkTime / this.revmult; // RANGED ATTACK

				_13Each(this.bullets, function (_cbul) {
					if(_cbul.dead)
					{
						var _adir = _wdir;
						
						_cbul.undie(2500);

						_cbul.pos = _13ObjClone(_this.pos);
						
						_cbul.vel[0] = _13Cos(_adir) * 600;
						_cbul.vel[1] = _13Sin(_adir) * 600;
						
						return true;
					}
				});
				
				_13MediaSounds.shoot.play();
			}
		}
	});
}