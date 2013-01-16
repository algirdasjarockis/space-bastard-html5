//
// GUI Progress Bar Class
//

//
// constructor
//
Engine.GuiProgress = function(bodySprite, stepSprite, gameObject)
{
	// game object
	this._world = gameObject;

	// render pipe
	this._rp = this._world && this._world.rp;

	// body sprite
	this._sprite = null;
	if (bodySprite instanceof Engine.Sprite) {
		this._sprite = bodySprite.duplicate();
	}
	else if (bodySprite && this._world) {
		var spriteData = this._world.ssm.getSprite(bodySprite);
		this._sprite = spriteData.duplicate();
	}

	// step sprite
	this._stepSprite = null;
	if (stepSprite instanceof Engine.Sprite) {
		this._stepSprite = stepSprite;
	}
	else if (bodySprite && this._world) {
		this._stepSprite = this._world.ssm.getSprite(stepSprite);
	}

	// step sprites list for rendering, idea is for making step sprite animate
	this._stepSprites = [];

	// one step value in %
	this._stepValue = 100 / (this._sprite.width() / this._stepSprite.width());

	this.value = 0;
	this.border = 1;
	this.visible = true;

	// events
	Engine.EventManagerMixin(this);
	this.registerEvents(['update']);
}


//
// Some borrowed methods from Engine.Entity
//
Engine.GuiProgress.prototype.addToRenderPipe = Engine.Entity.prototype.addToRenderPipe;
Engine.GuiProgress.prototype.removeFromRenderPipe = Engine.Entity.prototype.removeFromRenderPipe;
Engine.GuiProgress.prototype.x = Engine.Entity.prototype.x;
Engine.GuiProgress.prototype.y = Engine.Entity.prototype.y;
Engine.GuiProgress.prototype.width = Engine.Entity.prototype.width;
Engine.GuiProgress.prototype.height = Engine.Entity.prototype.height;
Engine.GuiProgress.prototype.scale = Engine.Entity.prototype.scale;
Engine.GuiProgress.prototype.update = Engine.Entity.prototype.update;


Engine.GuiProgress.prototype.render = function()
{
	if (!this.visible) {
		return false;
	}
	if (this._stepSprites.length <= 0) {
		var totalSteps = (this._sprite.width() - this.border * 2) / this._stepSprite.width();
		this._stepValue = 100 / totalSteps;

		for (var i = 0; i < totalSteps; i += 1) {
			var sprite = this._stepSprite.duplicate();
			sprite.skip = 7;
			sprite.x = this.x() + (this.border + sprite.width() * i);
			sprite.y = this.y();
			this._stepSprites.push(sprite);
		}
	}

	var stepCount = this.value / this._stepValue;
	for (var i = 0; i < stepCount; i += 1) {
		this._stepSprites[i].play();
	}

	if (this._sprite) {
		this._sprite.play();
	}
}