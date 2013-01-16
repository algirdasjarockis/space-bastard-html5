//
// Mouse Pointer
//

//
// constructor
//
Engine.GuiPointer = function(sprite, gameObject)
{
	// game object
	this._world = gameObject;

	// render pipe
	this._rp = this._world && this._world.rp;

	// current action name of sprite
	this._sprite = null;
	if (sprite instanceof Engine.Sprite) {
		this._sprite = sprite.duplicate();
	}
	else if (sprite && this._world) {
		var spriteData = this._world.ssm.getSprite(sprite);
		this._sprite = spriteData.duplicate();
	}

	this.visible = true;

	Engine.EventManagerMixin(this);
	this.registerEvents(['update']);
}


//
// Some borrowed methods from Engine.Entity
//
Engine.GuiPointer.prototype.addToRenderPipe = Engine.Entity.prototype.addToRenderPipe;
Engine.GuiPointer.prototype.removeFromRenderPipe = Engine.Entity.prototype.removeFromRenderPipe;
Engine.GuiPointer.prototype.x = Engine.Entity.prototype.x;
Engine.GuiPointer.prototype.y = Engine.Entity.prototype.y;
Engine.GuiPointer.prototype.width = Engine.Entity.prototype.width;
Engine.GuiPointer.prototype.height = Engine.Entity.prototype.height;
Engine.GuiPointer.prototype.scale = Engine.Entity.prototype.scale;
Engine.GuiPointer.prototype.action = Engine.Entity.prototype.action;
Engine.GuiPointer.prototype.update = Engine.Entity.prototype.update;


//
// render callback
//
Engine.GuiPointer.prototype.render = function()
{
	if (this._sprite && this.visible) {
		this._sprite.play();
	}
}
