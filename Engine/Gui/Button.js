//
// GUI Button Class
//

//
// constructor
//
Engine.GuiButton = function(sprite, gameObject)
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
	this.text = "Button";
	this.captionColor = {
		"normal": "#ffffff",
		"hover": "#ff0000"
	}
	this.captionFont = {
		"normal": "18px Tahoma",
		"hover": "18px Tahoma"
	}
	this.captionMargin = {
		"top": 0,
		"right": 0,
		"bottom": 0,
		"left": 0
	}
	this.captionAlign = "left";

	Engine.ObjectHelperMixin(this);

	// events
	Engine.EventManagerMixin(this);
	this.registerEvents(['update', 'hover', 'out', 'click'])
		.on('hover', function() {
			this.action('hover');
		})
		.on('out', function() {
			this.action('main');
		})
}


//
// Some borrowed methods from Engine.Entity
//
Engine.GuiButton.prototype.addToRenderPipe = Engine.Entity.prototype.addToRenderPipe;
Engine.GuiButton.prototype.removeFromRenderPipe = Engine.Entity.prototype.removeFromRenderPipe;
Engine.GuiButton.prototype.x = Engine.Entity.prototype.x;
Engine.GuiButton.prototype.y = Engine.Entity.prototype.y;
Engine.GuiButton.prototype.width = Engine.Entity.prototype.width;
Engine.GuiButton.prototype.height = Engine.Entity.prototype.height;
Engine.GuiButton.prototype.scale = Engine.Entity.prototype.scale;
Engine.GuiButton.prototype.action = Engine.Entity.prototype.action;
Engine.GuiButton.prototype.update = Engine.Entity.prototype.update;


//
// render callback
//
Engine.GuiButton.prototype.render = function()
{
	if (!this.visible) {
		return false;
	}
	if (this._sprite) {
		this._sprite.play();
	}

	var ctx = this._world && this._world.canvas.getContext("2d");

	if (ctx) {
		ctx.save();
		ctx.fillStyle = (this.action() == "main") ? this.captionColor.normal : this.captionColor.hover;
		ctx.font = (this.action() == "main") ? this.captionFont.normal : this.captionFont.hover;
		ctx.textAlign = this.captionAlign;
		ctx.textBaseline = "middle";

		// label coordinates (default by left align)
		var labelX = this.x();
		var labelY = this.y() + this.height() / 2;

		switch (this.captionAlign) {
		case "center":
			labelX += this.width() / 2;
			break;

		case "right":
			labelX += this.width();
			break;
		}

		labelX += (this.captionMargin.left - this.captionMargin.right);
		labelY += (this.captionMargin.top - this.captionMargin.bottom);

		ctx.fillText(this.text, labelX, labelY, this.width());
		ctx.restore();
	}
}
