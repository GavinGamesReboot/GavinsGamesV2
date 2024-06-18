/** class for particle effects **/

function _13Particles(_world, bName, maxNum) {
	var _pList = [];
	for(var i = 0; i < maxNum; i++)
	{
		var _cBody = _world.addBody(bName);
		_cBody.fixed = false;
		_cBody.die();
		_pList.push(_cBody);
	}
	
	var _retObj = {
		pos: [0, 0],
		vel: [0, 0],
		rot: 0,
		rotvel: 0,
		scale: 1, 
		alpha: 1,
		list: _pList,
		rnd: { // rnd props gets multiplied by -1 < random < 1 and summed with the base ones
			pos: [0, 0],
			vel: [0, 0],
			rot: 0,
			rotvel: 0,
			scale: 0, // all rnd props get summed with base, so i need 0 here
			alpha: 0
		},
		grav: 1,
		lifespan: 350,
		bounce: 1,
		freq: 0,
		on: false,
		fx: {}, // used for changing props according to lifespan remaining
		update: function(timePassed)
		{
			if(this.link) // linked to some body (ie: wisps)
			{				
				this.on = !this.link.dead;

				if(this.on)
				{
					for(var i in this.pos)
					{
						this.pos[i] = this.link.pos[i];
						this.vel[i] = this.link.vel[i] * 0.65;
					}
					
					this.alpha = this.link.alpha;	
				}				
			}
			
			if(this.on)
			{
				// if on is a number: emit that number of particles
				// if on is boolean: emit continously/explode all particles if freq == 0
				var _pnum = 0;
				var _em = this;
				
				if(this.freq <= 0) // explosion
				{
					if(typeof this.on == 'number') _pnum = this.on;
					else _pnum = this.list.length;
					this.on = false;
				}
				else{
					if(this._lastEmit == null) this._lastEmit = 0;
					this._lastEmit += timePassed;
				
					_pnum = Math.floor(this._lastEmit / this.freq);
					this._lastEmit = this._lastEmit % this.freq;
					
					if(typeof this.on == 'number') {
						if(this.on <= _pnum) {
							_pnum = this.on;
							this.on = false;
						}
						else this.on -= _pnum;
					}
				}

				_13Rep(_pnum, function () {
					_13Each(_em.list, function (_cP) {
						if(_cP.dead)
						{
							_13ObjExtend(_cP, {
								dead: false,
								lifespan: _em.lifespan,
								grav: _em.grav,
								collide: _em.collide,
								bounce: _em.bounce,
								autorot: _em.autorot,
								start: {},
								beforeUpdate: function () {
									for(var i in _em.fx)
									{
										var _bp = this.lifespan / _em.lifespan; // 1 to 0
										this[i] = this.start[i] * Math.pow(_bp, 0.5);
									}
								},
								onCollide: function() {
									if(_em.diecoll) this.die();
								}
							});
							
							for(var i in _em.rnd)
							{
								if(_cP[i].length != null)
								{
									_13Rep(2, function(j) {
										_cP[i][j] = _em[i][j] + _13RandBetween(-1, 1) * _em.rnd[i][j];
									});
								}
								else {
									_cP[i] = _em[i] + _13RandBetween(-1, 1) * _em.rnd[i];
									_cP.start[i] = _cP[i];
								}
							}
							
							return true;
						}
					});
				});
			}
		}
	}
	
	_world.particles.push(_retObj);
	
	return _retObj;
}
