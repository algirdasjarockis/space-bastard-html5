//
// Sprite Class
//

//
// constructor
//
Engine.Sprite = function (canvas, img)
{
	var self = this;

	var _canvas = canvas,
		_ctx = null,
		// skipped frame counter
		_skipped = 0;

	if (canvas) {
		_ctx = canvas.getContext("2d");
	}

	// collection of sprite available actions/animations
	var _actions = {};

	//
	// PUBLIC
	//
	// current display dimensions and positions
	this.x = 0;
	this.y = 0;
	this.scale = 1.0;
	// how much skip frames
	this.skip = 5;

	// current active action
	this.action = "main";
	this.img = img;

	Engine.ObjectHelperMixin(self);
	Engine.EventManagerMixin(self);
	self.registerEvents(['lastframe', 'animationend']);

	//
	// initialise sprite
	//
	// @chainable
	// @param Canvas canvas - html canvas element
	//
	this.init = function(canvas)
	{
		if (canvas) {
			_canvas = canvas;
			_ctx = _canvas.getContext("2d");
		}

		self.action = "main";
		return self;
	}


	//
	// add sprite animation action
	//
	// @chainable
	// @param string actionName - name of action
	// @param Object action - action object
	//
	this.addAction = function(actionName, action)
	{
		action.name = actionName;
		_actions[actionName] = action;
		return self;
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
		if (self.action in _actions) {
			if (val === undefined) {
				return _actions[self.action].width * self.scale;
			}
			else {
				_actions[self.action].width = val;
			}
		}

		return self;
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
		if (self.action in _actions) {
			if (val === undefined) {
				return _actions[self.action].height * self.scale;
			}
			else _actions[self.action].height = val;
		}

		return self;
	}


	//
	// returns copy of self
	//
	this.duplicate = function()
	{
		var copy = new Engine.Sprite(_canvas, Object.create(self.img));
		copy.init();
		copy.set(self.get());

		for (var name in _actions) {
			var action = _actions[name];

			// so lazy but so classy object value setting!
			var newAction = Engine.ObjectHelperMixin({});
			newAction.set(Engine.ObjectHelperMixin(action).get());
			
			copy.addAction(name, newAction);
		}

		return copy;
	}


	//
	// reset current's or given action animation
	//
	// @chainable
	// @param string actionName - action name (optional)
	//
	this.reset = function(actionName)
	{
		if (typeof(actionName) == "undefined") {
			actionName = self.action;
		}

		if (actionName in _actions) {
			var act = _actions[actionName];
			act.currFrame = 0;
			act.repeated = 0;
		}

		return self;
	}


	//
	// Main drawing function
	//
	// @chainable
	// @param string actionName - action to be played (optional)
	//
	this.play = function(actionName)
	{
		if (typeof(actionName) == "undefined")
			actionName = this.action;

		if (actionName in _actions) {
			var act = _actions[actionName];

			if ((_skipped += 1) >= self.skip) {
				_skipped = 0;

				if ((act.currFrame += 1) >= act.totalFrames) {
					// reached last frame
					self.getEventManager().fire('lastframe', self, self, self.action);

					if(act.repeat > 0 && (act.repeated += 1) >= act.repeat) {
						// repeat set to non-zero value and repeated value reached end! Stop animation!
						self.getEventManager().fire('animationend', self, self, self.action);
						return self;
					}
					else {
						act.currFrame = 0;
					}
				}
			}

			_ctx.drawImage(self.img, act.sx + act.width * act.currFrame, act.sy, act.width, act.height,
				self.x, self.y, act.width * self.scale, act.height * self.scale);

			/*
			this._ctx.strokeStyle = "#ffffff";
			this._ctx.beginPath();
			this._ctx.arc(
				this.x + act.width * this.scale / 2, this.y + act.height * this.scale / 2,
				act.width * this.scale / 2,
				0, Math.PI*2, true
			);
			this._ctx.stroke();
			this._ctx.closePath(); */
		}
		else console.log("Engine.Sprite.loop(): No such action!");

		return self;
	}
}
