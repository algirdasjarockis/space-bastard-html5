//
// @mixin SB.GameEntity
//
// Mixin for Engine.Entity
//
//

SB.GameEntity = function(entity)
{
	// update() call count since last shooting
	var _updateCount = 0;

	// how many frames should be skipped to perform shoot
	var _skip = 0;

	// boolean which allows shooting from the start
	// (it's usable only for enemies or not human controlled entities)
	entity.autoShooting = (entity.autoShooting === undefined) ? true : entity.autoShooting;

	// aditional new events
	entity.registerEvents(['shoot']);

	// callback for frame counting
	entity.on('update', function() {
		_updateCount += 1;
	});

	//
	// some specifications only for enemy
	//
	if (entity.type == 'enemy') {
		var _currMov = 0,
			_waypoint = null,
			_firstIteration = true;

		// more cool events for bastards!
		entity.registerEvents(['waypointend', 'scrollxsidechange']);

		entity.on('update', function() {
			if (this.movement[_currMov] != undefined) {
				if (_waypoint) {
					// continue to waypoint
					this.move(this.dx, this.dy);
					if ((_waypoint.currIteration += 1) >= _waypoint.maxIterations) {
						_waypoint = null;
						_currMov += 1;
						_firstIteration = true;
						entity.getEventManager().fire('waypointend', entity, entity, _currMov);
					}
				}
				else {
					if (typeof(this.movement[_currMov]) == 'object' && this.movement[_currMov].x && this.movement[_currMov].y) {
						// we got destination point!
						_waypoint = {
							x: this.movement[_currMov].x,
							y: this.movement[_currMov].y,
							currIteration: 0
						}

						var lenX = _waypoint.x - this.x();
						var lenY = _waypoint.y - this.y();

						if (lenX == 0 && lenY == 0) {
							_waypoint = null;
						}
						else {
							this.dx = lenX ? 1 * this.speed * -lenX / -(Math.abs(lenX)): 0;
							this.dy = lenX ? lenY / Math.abs(lenX) * this.speed : 1 * this.speed * -lenY / -(Math.abs(lenY));		// getting sign for correct direction

							_waypoint.maxIterations = (lenX) ? lenX / this.dx : lenY / this.dy;
							_waypoint.maxIterations = Math.abs(_waypoint.maxIterations);
						}
					}
					else if (this.movement[_currMov] == "scroll-x") {
						if (_firstIteration) {
							// set dx only once
							this.dx = this.speed;
							_firstIteration = false;
						}
						var x = this.x();
						if (x > SB.game.canvas.width || x < 0) {
							this.dx *= -this.speed;
							this.getEventManager().fire('scrollxsidechange', this, this, this.dx);
						}

						this.x(x + this.dx);
					}
					else if (this.movement[_currMov] == "kamikaze") {
						this.moveTo(SB.game.ent.hero.x(), SB.game.ent.hero.y());
					}
				}
			}
		});


		//
		// set movement points to entity
		//
		// @chainable
		// @param array movement - array of movement data
		//
		entity.setMovement = function(movement)
		{
			_currMov = 0,
			_waypoint = null,
			_firstIteration = true;

			entity.movement = movement;
			return entity;
		}
	}

	//
	// method for producing bullets on screen (a.k.a shooting)
	//
	// @chainable
	// @param Object ammoData - ammo data
	//
	entity.shoot = function(ammoData)
	{
		if (!entity.autoShooting) {
			return entity;
		}
		var defaultAmmoData = {
			sprite: "ammo1",
			damage: 20,
			velocity: 2,
			ratio: 4,
			angles: [90]
		}
		ammoData = Engine.Util.merge(defaultAmmoData, ammoData);

		if (ammoData.ratio) {
			if (!_skip) {
				_skip = Math.round(SB.game.getFps() / ammoData.ratio);
			}
			if (_updateCount / _skip >= 1) {
				_updateCount = 0;
			}
			else {
				return entity;
			}
		}

		entity.getEventManager().fire('shoot', entity, entity, ammoData);
		for (var i = 0, max = ammoData.angles.length; i < max; i += 1) {
			var angle = ammoData.angles[i];
			new Engine.Entity(ammoData.sprite, SB.game)
				.x(entity.x() + entity.width() / 2)
				.y(entity.y())
				.set({
					type: "ammo",
					damage: ammoData.damage,
					velocity: ammoData.velocity,
					angle: angle,
					dx: (angle == 90) ? 0 : Math.cos(Math.PI * angle / 180) * ammoData.velocity,
					dy: Math.sin(Math.PI * angle / 180) * ammoData.velocity
				})
				.addToRenderPipe()
				.addToCollisions(entity.type == 'enemy' ? 'enemies' : 'friends')
				.on('update', function() {
					var y = this.y();
					if (y <= -10 || y >= SB.game.canvas.height + 20) {
						this.removeFromRenderPipe()
							.removeFromCollisions();
						return;
					}

					this.x(this.x() + this.dx)
						.y(y - this.dy);
				})
				.on('collide', function(item) {
					if (item.type != "ammo") {
						var explosion = new Engine.Entity("ammoexplosion1", SB.game);
						explosion.x(this.x())
							.y(this.y())
							.scale(0.2 + Math.random())
							.on('lastframe', function() {
								explosion.removeFromRenderPipe();
							})
							.addToRenderPipe();
					}
				});
		}

		return entity;
	}

	return entity;
}