//
// Mouse Pointer
//

//
// constructor
//
Engine.GuiPointer = function(sprite, gameObject)
{
	this.visible = true;

	Engine.ObjectHelperMixin(this);
	this.inheritClass(Engine.Entity, arguments,
		{'public': ['getSprite', 'addToRenderPipe', 'removeFromRenderPipe', 'x', 'y', 'width', 'height', 'scale', 'action', 'update']});

	Engine.EventManagerMixin(this);
	this.registerEvents(['update']);

	//
	// render callback
	//
	this.render = function()
	{
		var _sprite = this.getSprite();
		var ctx = gameObject.canvas.getContext("2d");
		if (_sprite && this.visible) {
			ctx.save();
			ctx.translate(this.x(), this.y());
			ctx.rotate(this.rot);
			_sprite.play();
			ctx.restore();
		}
	}
}
