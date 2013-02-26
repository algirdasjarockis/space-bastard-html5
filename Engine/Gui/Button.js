//
// GUI Button Class
//

//
// constructor
//
Engine.GuiButton = function(sprite, gameObject)
{
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
	this.inheritClass(Engine.Entity, arguments,
		{'public': ['getSprite', 'addToRenderPipe', 'removeFromRenderPipe', 'x', 'y', 'width', 'height', 'scale', 'action', 'update']});

	// events
	Engine.EventManagerMixin(this);
	this.registerEvents(['update', 'hover', 'out', 'click'])
		.on('hover', function() {
			this.action('hover');
		})
		.on('out', function() {
			this.action('main');
		});


	//
	// render callback
	//
	this.render = function()
	{
		if (!this.visible) {
			return;
		}
		var _sprite = this.getSprite(),
			ctx = gameObject.canvas.getContext("2d");

		ctx.save();
		ctx.translate(this.x(), this.y());
		ctx.rotate(this.rot);
		if (_sprite) {
			_sprite.play();
		}

		ctx.save();
		ctx.fillStyle = (this.action() == "main") ? this.captionColor.normal : this.captionColor.hover;
		ctx.font = (this.action() == "main") ? this.captionFont.normal : this.captionFont.hover;
		ctx.textAlign = this.captionAlign;
		ctx.textBaseline = "middle";

		// label coordinates (default by left align)
		var labelX = this.x();
		var labelY = this.y() + this.height() / 2;

		labelX = 0;
		labelY = 0;

		/*
		switch (this.captionAlign) {
		case "center":
			labelX += this.width() / 2;
			break;

		case "right":
			labelX += this.width();
			break;
		}
		*/
		labelX += (this.captionMargin.left - this.captionMargin.right);
		labelY += (this.captionMargin.top - this.captionMargin.bottom);

		ctx.fillText(this.text, labelX, labelY, this.width());
		ctx.restore();

		ctx.restore();
	}
}
