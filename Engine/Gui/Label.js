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

	// game object
	this._world = gameObject;

	// render pipe
	this._rp = this._world && this._world.rp;

	Engine.ObjectHelperMixin(this);
}


//
// Some borrowed methods from Engine.Entity
//
Engine.GuiLabel.prototype.addToRenderPipe = Engine.Entity.prototype.addToRenderPipe;
Engine.GuiLabel.prototype.removeFromRenderPipe = Engine.Entity.prototype.removeFromRenderPipe;


// - C -
// update callback
//
Engine.GuiLabel.prototype.update = function()
{

}


//
// render callback
//
Engine.GuiLabel.prototype.render = function()
{
	if (!this.visible) {
		return false;
	}
	var ctx = this._world && this._world.canvas.getContext("2d");
	if (ctx) {
		ctx.save();
		ctx.fillStyle = this.color;
		ctx.font = this.font;
		ctx.textAlign = this.align;
		ctx.fillText(this.text, this.x, this.y, this.width);
		ctx.restore();
	}
}
