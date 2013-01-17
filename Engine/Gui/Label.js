//
// GUI Label Class
//

//
// constructor
//
Engine.GuiLabel = function(gameObject)
{
	this.x = 0;
	this.y = 0;
	this.width = 500;
	this.height = 0;
	this.text = "Label";
	this.color = "white";
	this.font = "20px Tahoma";
	this.align = "left";
	this.type = 0;
	this.visible = true;

	Engine.ObjectHelperMixin(this);
	this.inherit(new Engine.Entity(null, gameObject),
		{'public': ['addToRenderPipe', 'removeFromRenderPipe', 'update']});


	//
	// render callback
	//
	this.render = function()
	{
		if (!this.visible) {
			return false;
		}

		var ctx = gameObject.canvas.getContext("2d");
		if (ctx) {
			ctx.save();
			ctx.fillStyle = this.color;
			ctx.font = this.font;
			ctx.textAlign = this.align;
			ctx.fillText(this.text, this.x, this.y, this.width);
			ctx.restore();
		}
	}
}
