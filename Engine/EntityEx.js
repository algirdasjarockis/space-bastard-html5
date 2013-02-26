//
// Game Object Class
//

//
// constructor
//
// @param Engine.Sprite/String sprite - sprite name or valid sprite object
//    				(no need to give copy of object, it is done in constructor)
// @param Engine.Game - game object
//
Engine.Entity = (function()
{
	var bank = {};

	function Entity(specs, gameObject)
	{
		var self = this;

		this.health = 100;
		this.maxHealth = this.health;
		this.weight = 100;
		this.damage = 0;
		this.type = 0;
		this.name = 'nameless';
		this.scene = '';
		this.layer = '';
		this.rot = 0;

		// render pipe
		var _rp = (gameObject) ? gameObject.rp : null,
			_sprite = null,
			_sprites = [],
			_collisionGroup = 'friends',
			_rect = {x: 0, y: 0, w: 0, h: 0};

		function _init()
		{
			if (specs) {
				if (specs instanceof Engine.SpriteEx) {
					// set up sprite from instance
					_sprite = specs.duplicate();
				}
				else if (typeof specs == 'string') {
					// set up sprite by it's name
					var spriteData = gameObject.ssm.getSprite(specs);
					_sprite = spriteData.duplicate();
				}
				else if ('sprite' in specs) {
					if (specs.sprite instanceof Engine.SpriteEx) {
						// set up sprite from instance
						_sprite = specs.sprite.duplicate();
					}
					else if (typeof specs.sprite == 'string') {
						// set up sprite by it's name
						var spriteData = gameObject.ssm.getSprite(specs.sprite);
						_sprite = spriteData.duplicate();
					}
				}

				if (_sprite) {
					_rect.w = _sprite.width();
					_rect.h = _sprite.height();
					_sprites.push(_sprite);
					_sprite.set({x: 0, y: 0, rot: 0, body: true})
						.on('lastframe', function(_sprite, action) {
							self.getEventManager().fire('lastframe', self, self, _sprite, action);
						});
				}
			}
		}

		// mixins
		Engine.ObjectHelperMixin(this);

		// events
		Engine.EventManagerMixin(this);
		this.registerEvents([
			'die', 'beforehealthchange', 'healthchange', 'collide', 'update', 'lastframe'
		]);


		//
		//
		//
		this.loadDataFile = function(specs)
		{
			if (specs) {
				if (!('path' in specs)) {
					throw new Error("No 'path' defined in argument object");
				}
				if (!('name' in specs)) {
					throw new Error("No 'name' defined in argument object");
				}

				if (!(specs.name in bank) || specs.rewrite) {
					Engine.Util.loadJs(specs.path,
						function success() {
							if (specs.name in bank)
								console.log(Engine.Util.format("Entity '{0}' loaded!", specs.name));
							else console.log(Engine.Util.format("Entity '{0}' was loaded, but not found by name '{1}'!", specs.path, specs.name));

							if (typeof specs.success == 'function') {
								specs.success(self, specs.name, specs.path);
							}

							self.getEventManager().fire('datafileload', self, self, specs.name, specs.path);

							_sprites = [];
							var maxLeftWidth = 0,
								maxRightWidth = 0,
								maxTopHeight = 0,
								maxBotHeight = 0;

							for (var i = 0, len = bank[specs.name].sprites.length; i < len; i += 1) {
								var spriteData = bank[specs.name].sprites[i];
								var sprite = gameObject.ssm.getSprite(spriteData.name);
								if (sprite) {
									_sprites[i] = sprite.duplicate()
										.set({
											name: spriteData.name,
											x: spriteData.x,
											y: spriteData.y,
											rot: spriteData.rot,
											body: spriteData.body
										});

									var xLeft = _sprites[i].width() / 2 - spriteData.x,
										xRight = _sprites[i].width() / 2 + spriteData.x,
										yTop = _sprites[i].height() / 2 - spriteData.y,
										yBot = _sprites[i].height() / 2 + spriteData.y;

									maxLeftWidth = Math.max(maxLeftWidth, xLeft);
									maxRightWidth = Math.max(maxRightWidth, xRight);
									maxTopHeight = Math.max(maxTopHeight, yTop);
									maxBotHeight = Math.max(maxBotHeight, yBot);
								}
								else {
									throw new Error(Engine.Util.format("Sprite not found: '{0}'", spriteData.name));
								}
							}

							_rect.w = maxLeftWidth + maxRightWidth;
							_rect.h = maxTopHeight + maxBotHeight;
						},

						function failure() {
							if (typeof specs.failure == 'function') {
								specs.failure(self, specs.name, specs.path);
							}

							self.getEventManager().fire('datafileloaderror', self, self, specs.name, specs.path);
						}
					);
				}
			}
			else {
				throw new Error("No argument object was passed");
			}

			// var e = new Engine.EntityEx(null, SB.game).loadDataFile({path: 'data/entities/hero.js', name: 'hero'});
			return this;
		}


		this.getSprite = function()
		{
			return _sprite;
		}


		//
		//
		//
		this.getSprites = function()
		{
			return _sprites;
		}


		//
		// returns or sets X position
		//
		// @chainable
		// @param int xVal
		// @return int when no argument is supplied
		//
		this.x = function(xVal)
		{
			if (typeof(xVal) == "undefined") {
				return _rect.x;
			}
			else {
				_rect.x = xVal;
			}

			return this;
		}



		//
		// returns or sets Y position
		//
		// @chainable
		// @param int yVal
		// @return int | NaN
		//
		this.y = function(yVal)
		{
			if (typeof(yVal) == "undefined") {
				return _rect.y;
			}
			else {
				_rect.y = yVal;
			}

			return this;
		}


		//
		// move entity by given deltas
		//
		// @chainable
		// @param float dx
		// @param float dy
		//
		this.move = function(dx, dy)
		{
			_rect.x += dx;
			_rect.y += dy;

			return this;
		}


		//
		// moves entity to desired location
		//
		// @chainable
		// @param int destX - x
		// @param int destY - y
		//
		this.moveTo = function(destX, destY)
		{
			if (_sprite) {
				if (this.speed == undefined) {
					this.speed = 1;
				}

				var lenX = destX - this.x();
				var lenY = destY - this.y();

				if (lenX != 0 && lenY != 0) {
					var dx = 0;
					var dy = 0;
					if (Math.abs(lenX) > Math.abs(lenY)) {
						dx = -lenX / -(Math.abs(lenX));
						dy = lenY / lenX;
						if (lenX < 0 && lenY < 0) {
							dy = -dy;
						}
					}
					else {
						dy = -lenY / -(Math.abs(lenY));
						dx = lenX / lenY;
						if (lenX < 0 && lenY < 0) {
							dx = -dx;
						}
					}

					this.move(dx * this.speed, dy * this.speed);
					return true;
				}
			}

			return this;
		}


		//
		// returns or sets width
		//
		// @chainable
		// @param int val
		// @return int
		//
		this.width = function(val)
		{
			//if (_sprite) {
			//	return _sprite.width(val);
			//}

			return _rect.w;

			return this;
		}


		//
		// returns or sets height
		//
		// @chainable
		// @param int val
		// @return int
		//
		this.height = function(val)
		{
			if (_sprite) {
				return _sprite.height(val);
			}

			return _rect.h;

			return this;
		}


		//
		// returns or sets scale
		//
		// @chainable
		// @param int val
		// @return int
		//
		this.scale = function(val)
		{
			if (_sprite) {
				if (typeof(val) == "undefined") {
					return _sprite.scale;
				}
				else _sprite.scale = val;
			}

			return this;
		}


		//
		// adds health by given value (minus value will reduce it)
		//
		// @chainable
		// @param int val
		//
		this.addHealth = function(val)
		{
			if (!val) {
				return this.health;
			}

			if (this.getEventManager().fire('beforehealthchange', this, this, this.health, val) === false) {
				// cancel health change if we got false from at least one callback
				return this;
			}

			var oldHealth = this.health;
			this.health += val;

			if (this.health > this.maxHealth){
				this.health = this.maxHealth;
			}

			this.getEventManager().fire('healthchange', this, this, oldHealth, val);
			if (this.health <= 0) {
				this.getEventManager().fire('die', this, this);
			}

			return this;
		}


		//
		// refills health to max
		//
		// @chainable
		//
		this.refillHealth = function()
		{
			var missingHp = this.maxHealth - this.health;
			this.addHealth(missingHp);

			return this;
		}


		//
		// sets/gets current action
		//
		// @param string actionName - name of action, if null - value is returned
		//
		this.action = function(actionName)
		{
			if (_sprite) {
				if (typeof(actionName) == "undefined")
					return _sprite.action;

				_sprite.action = actionName;
				_sprite.reset(actionName);
			}

			return "";
		}


		//
		// adds self to render pipe
		//
		// @chainable
		// @param string sceneName - scene name
		// @param string layerName - layer name
		//
		this.addToRenderPipe = function(sceneName, layerName)
		{
			if (_rp) {
				_rp.addItem(this, sceneName, layerName);
			}
			else console.log("[E] No render pipe!");

			return this;
		}


		//
		// removes self from render pipe
		//
		// @chainable
		//
		this.removeFromRenderPipe = function()
		{
			if (_rp) {
				_rp.removeItem(this);
			}

			return this;
		}


		//
		// adds self to collision list
		//
		// @chainable
		// @param string group - collision group name
		//
		this.addToCollisions = function(group)
		{
			_collisionGroup = group;
			//gameObject._collisions["add" + group](this);
			gameObject.collisions.add(group, this.scene, this);
			return this;
		}


		//
		// removes self from collision list
		//
		// @chainable
		//
		this.removeFromCollisions = function()
		{
			gameObject.collisions.remove(_collisionGroup, this.scene, this);
			return this;
		}


		//
		// returns copy
		//
		this.duplicate = function()
		{
			var ent = new Engine.Entity(_sprite, gameObject);

			ent.health = this.health;
			ent.maxHealth = this.maxHealth;
			ent.weight = this.weight;
			ent.damage = this.damage;
			ent.dx = this.dx;
			ent.dy = this.dy;
			ent.type = this.type;
			ent.layer = this.layer;
			ent.scene = this.scene;

			ent.update = this.update;
			ent.onCollide = this.onCollide;
			ent.onDie = this.onDie;
			return ent;
		}


		//
		// frame update function
		//
		this.update = function(delta)
		{
			self.getEventManager().fire('update', this, this, delta);
		}


		//
		// frame render function
		//
		this.render = function(delta)
		{
			//if (_sprite) {
			//	_sprite.play(false, delta);
			//}

			var ctx = gameObject.canvas.getContext("2d");

			ctx.save();
			ctx.translate(_rect.x, _rect.y);
			ctx.rotate(self.rot);
			for (var i = 0, len = _sprites.length; i < len; i += 1) {
				_sprites[i].play(false, delta);
			}
			ctx.restore();
		}

		_init();
		return self;
	}

	// static methods
	Entity.load = function(data)
	{
		if (data && 'name' in data) {
			bank[data.name] = data;
		}
	}

	return Entity;
})();

