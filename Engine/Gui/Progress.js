//
// GUI Progress Bar Class
//

//
// constructor
//
Engine.GuiProgress = function(bodySprite, stepSprite, gameObject)
{
	Engine.ObjectHelperMixin(this);
	this.inherit(new Engine.Entity(bodySprite, gameObject), arguments,
		{'public': ['addToRenderPipe', 'removeFromRenderPipe', 'x', 'y', 'width', 'height', 'scale', 'update']});

	// step sprite
	var _stepSprite = null,
		_sprite = this.getSprite();

	if (stepSprite instanceof Engine.Sprite) {
		_stepSprite = stepSprite;
	}
	else if (stepSprite) {
		_stepSprite = gameObject.ssm.getSprite(stepSprite);
	}

	// step sprites list for rendering, idea is for making step sprite animate
	var _stepSprites = [];

	// one step value in %
	var _stepValue = 100 / (_sprite.width() / _stepSprite.width());

	this.value = 0;
	this.border = 1;
	this.visible = true;

	this.render = function()
	{
		if (!this.visible) {
			return;
		}

		var ctx = gameObject.canvas.getContext("2d");
		ctx.save();
			ctx.translate(this.x(), this.y());
			ctx.rotate(this.rot);

			if (_sprite) {
				_sprite.play();
			}

			if (_stepSprites.length <= 0) {
				var totalSteps = (_sprite.width() - this.border * 2) / _stepSprite.width();
				_stepValue = 100 / totalSteps;

				for (var i = 0; i < totalSteps; i += 1) {
					var sprite = _stepSprite.duplicate();
					sprite.skip = 7;
					sprite.x = this.border + sprite.width() * i;
					sprite.y = 0;
					_stepSprites.push(sprite);
				}
			}

			var stepCount = this.value / _stepValue;
			for (i = 0; i < stepCount; i += 1) {
				_stepSprites[i].play();
			}

		ctx.restore();
	}
}
