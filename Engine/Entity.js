//
// Game Object Class
//

//
// constructor
//
// @param Engine.Sprite/String sprite - sprite name or valid sprite object
//					(no need to give copy of object, it is done in constructor)
// @param Array - render pipe
//
Engine.Entity = function (sprite, gameObject)
{
	var self = this;

	this.health = 100;
	this.maxHealth = this.health;
	this.weight = 100;
	this.damage = 0;
	this.type = 0;
	this.scene = '';
	this.layer = '';

	// render pipe
	var _rp = gameObject.rp,
		_sprite = null;

	if (sprite instanceof Engine.Sprite) {
		_sprite = sprite.duplicate();
	}
	else if (sprite) {
		var spriteData = gameObject.ssm.getSprite(sprite);
		_sprite = spriteData.duplicate();
	}

	this._collisionGroup = "";

	// mixins
	Engine.ObjectHelperMixin(this);

	// events
	Engine.EventManagerMixin(this);
	this.registerEvents([
		'die', 'beforehealthchange', 'healthchange', 'collide', 'update', 'lastframe'
	]);

	if (_sprite) {
		_sprite.on('lastframe', function(sprite, action) {
			self.getEventManager().fire('lastframe', self, self, sprite, action);
		})
	}


	this.getSprite = function()
	{
		return _sprite;
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
		if (_sprite) {
			if (typeof(xVal) == "undefined")
				return _sprite.x;

			_sprite.x = xVal;
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
		if (_sprite) {
			if (typeof(yVal) == "undefined")
				return _sprite.y;

			_sprite.y = yVal;
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
		if (_sprite) {
			_sprite.x += dx;
			_sprite.y += dy;
		}

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
		if (_sprite) {
			return _sprite.width(val);
		}

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
		this._collisionGroup = group;
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
		gameObject.collisions.remove(this._collisionGroup, this.scene, this);
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
	this.update = function()
	{
		self.getEventManager().fire('update', this, this);
	}


	//
	// frame render function
	//
	this.render = function()
	{
		if (_sprite) {
			_sprite.play();
		}
	}


	return self;
}
