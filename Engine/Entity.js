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
	this.dx = 0;
	this.dy = 0;

	this.type = 0;

	// game object
	this._world = gameObject;

	// render pipe
	this._rp = this._world && this._world.rp;

	// current action name of sprite
	this._sprite = null;

	if (sprite instanceof Engine.Sprite) {
		this._sprite = sprite.duplicate();
	}
	else if (sprite) {
		var spriteData = this._world.ssm.getSprite(sprite);
		this._sprite = spriteData.duplicate();
	}

	this._collisionGroup = "";

	// mixins
	Engine.ObjectHelperMixin(this);

	// events
	Engine.EventManagerMixin(this);
	this.registerEvents([
		'die', 'beforehealthchange', 'healthchange', 'collide', 'update', 'lastframe'
	]);

	if (this._sprite) {
		this._sprite.on('lastframe', function(sprite, action) {
			self.getEventManager().fire('lastframe', self, self, sprite, action);
		})
	}

	return self;
}


//
// returns or sets X position
//
// @chainable
// @param int xVal
// @return int when no argument is supplied
//
Engine.Entity.prototype.x = function(xVal)
{
	if (this._sprite) {
		if (typeof(xVal) == "undefined")
			return this._sprite.x;

		this._sprite.x = xVal;
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
Engine.Entity.prototype.y = function(yVal)
{
	if (this._sprite) {
		if (typeof(yVal) == "undefined")
			return this._sprite.y;

		this._sprite.y = yVal;
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
Engine.Entity.prototype.move = function(dx, dy)
{
	if (this._sprite) {
		this._sprite.x += dx;
		this._sprite.y += dy;
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
Engine.Entity.prototype.moveTo = function(destX, destY)
{
	if (this._sprite) {
		if (this.speed == undefined) {
			this.speed = 1;
		}
		/*
		var lenX = destX - this.x();
		var lenY = destY - this.y();

		if (lenX != 0 && lenY != 0) {
			var dx = lenX ? 1 * this.speed * -lenX / -(Math.abs(lenX)): 0;
			var dy = lenX ? lenY / Math.abs(lenX) * this.speed : 1 * this.speed * -lenY / -(Math.abs(lenY));		// getting sign for correct direction
			this.move(dx, dy);
			return true;
		}
		*/

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

//console.log(Engine.Util.format("dx: {0}, dy: {1}", dx, dy));
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
Engine.Entity.prototype.width = function(val)
{
	if (this._sprite) {
		return this._sprite.width(val);
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
Engine.Entity.prototype.height = function(val)
{
	if (this._sprite) {
		return this._sprite.height(val);
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
Engine.Entity.prototype.scale = function(val)
{
	if (this._sprite) {
		if (typeof(val) == "undefined") {
			return this._sprite.scale;
		}
		else this._sprite.scale = val;
	}

	return this;
}


//
// adds health by given value (minus value will reduce it)
//
// @chainable
// @param int val
//
Engine.Entity.prototype.addHealth = function(val)
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
	this.getEventManager().fire('healthchange', this, this, oldHealth, val);
	if (this.health <= 0) {
		this.getEventManager().fire('die', this, this);
	}

	return this;
}


//
// sets/gets current action
//
// @param string actionName - name of action, if null - value is returned
//
Engine.Entity.prototype.action = function(actionName)
{
	if (this._sprite) {
		if (typeof(actionName) == "undefined")
			return this._sprite.action;

		this._sprite.action = actionName;
		this._sprite.reset(actionName);
	}

	return "";
}


//
// adds self to render pipe
//
// @chainable
// @param string sceneName - scene name
//
Engine.Entity.prototype.addToRenderPipe = function(sceneName)
{
	if (this._rp) {
		this._rp.addItem(this, sceneName);
	}
	else console.log("[E] No render pipe!");

	return this;
}


//
// removes self from render pipe
//
// @chainable
//
Engine.Entity.prototype.removeFromRenderPipe = function()
{
	if (this._rp) {
		this._rp.removeItem(this);
	}

	return this;
}


//
// adds self to collision list
//
// @chainable
// @param string group - collision group name
//
Engine.Entity.prototype.addToCollisions = function(group)
{
	this._collisionGroup = group;
	//this._world._collisions["add" + group](this);
	this._world.collisions.add(group, this);
	return this;
}


//
// removes self from collision list
//
// @chainable
//
Engine.Entity.prototype.removeFromCollisions = function()
{
	this._world.collisions.remove(this._collisionGroup, this);
	return this;
}


//
// returns copy
//
Engine.Entity.prototype.duplicate = function()
{
	var ent = new Engine.Entity(this._sprite, this._world);

	ent.health = this.health;
	ent.maxHealth = this.maxHealth;
	ent.weight = this.weight;
	ent.damage = this.damage;
	ent.dx = this.dx;
	ent.dy = this.dy;
	ent.type = this.type;

	ent.update = this.update;
	ent.onCollide = this.onCollide;
	ent.onDie = this.onDie;
	return ent;
}


// - C -
// frame update function
//
Engine.Entity.prototype.update = function()
{
	this.getEventManager().fire('update', this, this);
}


//
// frame render function
//
Engine.Entity.prototype.render = function()
{
	if (this._sprite) {
		this._sprite.play();
	}
}

