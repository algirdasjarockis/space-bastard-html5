//
// Background - loads, renders background
//

//
// constructor
//
Engine.Background = function(canvas)
{
    var self = this;
    //var _canvas = canvas;
	var _ctx = null;

	if (canvas)
		_ctx = canvas.getContext("2d");

	var _img = null;
	var _x = 0, _y = 0;

	// static mode functions
	var _updateStatic = function() {};
	var _renderStatic = function() {
		_ctx.drawImage(_img, 0, 0, _img.width, _img.height,
			0, 0, canvas.width, canvas.height);
	}


	function _modeLoop(config)
	{
		var defConfig = {
			speed: 0.5,
			stretch: false,			// should be auto true for smaller image than canvas
			stretchWidth: false,	// ignored when image is narrower than canvas
			direction: 1
		}

		config = Engine.Util.merge(defConfig, config);

		var type = config.type || 'vertical',
			largeImageMode = false,

			// if true, we need to draw "tail"
			tailActive = false,
			xRatio = _img.width / canvas.width,
			yRatio = _img.height / canvas.height,
			src = {
				x: 0, y: 0,
				w: 0, h: 0,
				sy: 0	// saved starting y position
			},

			target = {
				x: 0, y: 0,
				w: canvas.width,
				h: canvas.height
			},

			tailSrc = {
				x: 0, y: 0,
				w: 0, h: 0
			},

			tailTarget = {
				x: 0, y: 0,
				w: target.w, h: 0
			},

			types = {
				vertical: function() {
					this.updateFunc = function() {};
					this.renderFunc = function() {};

					if (config.stretch || _img.height < canvas.height) {
						// another drawing magic for stretched image

						// both src and tailSrc are full images, so two images are drawn to
						// achieve maximum smoothness in loop (it very depends when image
						// is extremely small)
						src.w = tailSrc.w = _img.width;
						src.h = tailSrc.h = _img.height;

						target.w = tailTarget.w = canvas.width;
						target.h = tailTarget.h = canvas.height;

						target.x = tailTarget.x = 0;
						target.y = 0;
						// "tail" is right above
						//tailTarget.y = (config.direction < 0) ? -target.h : target.h;
						tailTarget.y = config.direction * -target.h;

						// update
						this.updateFunc = function() {
							target.y += config.speed * config.direction;
							tailTarget.y += config.speed * config.direction;

							if ((config.direction < 0 && tailTarget.y <= 0) || (config.direction > 0 && tailTarget.y >= 0)) {
								// loop end, restart positions
								target.y = tailTarget.y;
								tailTarget.y = config.direction * -target.h;
							}
						}

						// render
						this.renderFunc = function() {
							_ctx.drawImage(_img, src.x, src.y, src.w, src.h,
								target.x, target.y, target.w, target.h);

							// draw image "tail"
							_ctx.drawImage(_img, tailSrc.x, tailSrc.y,
								tailSrc.w, tailSrc.h,
								tailTarget.x, tailTarget.y, tailTarget.w, tailTarget.h);
						}
					}
					else {
						var direction = -(config.direction);

						// width issues
						if (_img.width >= canvas.width) {
							// image is wider than canvas, need to decide stretching politics
							src.w = tailSrc.w = (config.stretchWidth) ? _img.width : canvas.width;
						}
						else {
							// image is narrower than canvas, we should force stretch by width
							src.w = tailSrc.w = _img.width;
							target.w = tailTarget.w = canvas.width;
							config.stretchWidth = true;
						}

						if (direction < 0) {
							// background moves to bottom
							src.sy = src.y = (_img.height - canvas.height);

							// update
							this.updateFunc = function() {
								src.y += config.speed * direction;

								if (src.y < 0) {
									src.y = 0;
									tailActive = true;
								}

								if (tailActive) {
									// reached image boundary
									if ((target.y += -(config.speed * direction)) >= canvas.height) {
										// current image is fully hidden, we should reset some coords to restart loop
										tailActive = false;

										src.y = src.sy;
										target.y = 0;
									}
									else {
										// image portion is shrinking
										target.h = src.h = canvas.height - target.y;

										// set tail painting coords
										tailSrc.y = _img.height - target.y
										tailSrc.h = tailTarget.h = target.y;
									}
								}
								else {
									target.y = 0;
									target.h = src.h = canvas.height;
								}
							}

							// render
							this.renderFunc = function() {
								_ctx.drawImage(_img, src.x, src.y, src.w, src.h,
									target.x, target.y, target.w, target.h);

								if (tailActive) {
									// draw image "tail"
									_ctx.drawImage(_img, tailSrc.x, tailSrc.y,
										tailSrc.w, tailSrc.h,
										tailTarget.x, tailTarget.y, tailTarget.w, tailTarget.h);
								}
							}
						}
						else {
							// background moves to top

							// background moves to bottom
							src.sy = src.y = 0;
							target.y = 0;

							// update
							this.updateFunc = function() {
								src.y += config.speed * direction;

								if (_img.height - src.y < canvas.height) {
									target.h = src.h = _img.height - src.y;
									tailActive = true;
								}

								if (tailActive) {
									// reached image boundary
									if (target.h <= 0) {
										// current image is fully hidden, we should reset some coords to restart loop
										tailActive = false;

										src.y = src.sy;
										target.y = 0;
									}
									else {
										// image portion is shrinking

										// set tail painting coords
										tailSrc.y = 0;
										tailSrc.h = tailTarget.h = canvas.height - src.h;
										tailTarget.y = target.h;
									}
								}
								else {
									target.h = src.h = canvas.height;
								}
							}

							// render
							this.renderFunc = function() {
								_ctx.drawImage(_img, src.x, src.y, src.w, src.h,
									target.x, target.y, target.w, target.h);

								if (tailActive) {
									// draw image "tail"
									_ctx.drawImage(_img, tailSrc.x, tailSrc.y,
										tailSrc.w, tailSrc.h,
										tailTarget.x, tailTarget.y, tailTarget.w, tailTarget.h);
								}
							}
						}
					}

					this.update = this.updateFunc;
					this.render = this.renderFunc;
				}
			};

		if (!(type in types)) {
			throw new Error("No such type '{0}' for background loop mode");
		}

		var loopObj = new types[type];


		//
		// recreate
		//
		this.init = function()
		{
			loopObj = new types[type];
		}



		//
		// mode update function
		//
		this.update = function()
		{
			loopObj.update();
		}


		//
		// mode render function
		//
		this.render = function()
		{
			loopObj.render();
		}
	}


	function _modeCurtain(config)
	{
		var _defConfig = {
			speed: 8
		};

		var finished = false,
			finitoCallbackCalled = false;

		// set config
		config = Engine.Util.merge(_defConfig, config);

		var xRatio = _img.width / canvas.width,
			yRatio = _img.height / canvas.height,
			type = config.type || 'horizontal',

			// all curtain types
			types = {
				horizontal: function() {
					var width = canvas.width / 2,
						leftX = 0,
						rightX = canvas.width;

					//
					// type update
					//
					this.update = function() {
						if (finished) {
							return;
						}

						if (leftX < width) {
							leftX += config.speed;
						}
						else {
							leftX = width;
							finished = true;
						}

						if (rightX > width) {
							rightX -= config.speed;
						}
						else {
							rightX = width;
						}
					},


					//
					// type render
					//
					this.render = function() {
						// left side
						var imgX = _img.width / 2 - (leftX * xRatio);
						_ctx.drawImage(_img, imgX, 0, _img.width / 2 - imgX, _img.height,
							0, 0, leftX, canvas.height);

						imgX = _img.width / 2;
						_ctx.drawImage(_img, imgX, 0, leftX * xRatio, _img.height,
							rightX, 0, canvas.width - rightX, canvas.height);

						if (!finitoCallbackCalled && finished) {
							finitoCallbackCalled = true;
							self.getEventManager().fire('finish', self, self);
						}
					}
				}
			};

		if (!(type in types)) {
			throw new Error("No such type '{0}' for background curtain mode");
		}

		var curtainObj = new types[type];


		//
		// recreate
		//
		this.init = function()
		{
			finished = false;
			finitoCallbackCalled = false;
			curtainObj = new types[type];
		}


		//
		// mode update function
		//
		this.update = function()
		{
			curtainObj.update();
		}


		//
		// mode render function
		//
		this.render = function()
		{
			curtainObj.render();
		}
	}


	//
	// sets mode to background
	//
	// @chainable
	// @param string mode - mode name (static, loop-y)
	//
	self.setMode = function(mode, config)
	{
		if (!(mode in _modes)) {
			throw new Error(Engine.Util.format("No such mode '{0}'", mode));
		}

		_mode = mode;

		if (typeof _modes[_mode] == 'function') {
			_modeObj = new _modes[_mode](config);
		}
		else {
			_modeObj = _modes[_mode];
		}

		return self;
	}


	//
	// reinit background internals
	//
	self.reinit = function()
	{
		if ('init' in _modeObj) {
			_modeObj.init();
		}
	}


	// modes
	var _mode = 'static',
		_modeObj = null,
		_modes = {
			// @TODO: old mode implementation, should be replaced soon
			'static': {
				update: _updateStatic,
				render: _renderStatic
			},
			// new mode implementation which i like. All mode logics must be encapsulated!
			'curtain': _modeCurtain,
			'loop': _modeLoop
		};

	Engine.EventManagerMixin(self);
	self.registerEvents(['beforeload', 'load', 'finish']);
	self.setMode(_mode);


	//
	// loads image for background
	//
	// @chainable
	// @param string imgUrl - image url
	// @param Function callback - callback
	//
	self.load = function(imgUrl, callback)
	{
		if (!imgUrl) {
			throw new Error("URL of image was not given");
		}

		self.getEventManager().fire('beforeload', self);
		_img = new Image();
		_img.onload = function() {
			if (typeof(callback) == 'function') {
				callback.apply(self, self);
			}

			self.getEventManager().fire('load', self, self);
		}

		_img.src = imgUrl;
		return self;
	}


	//
	// update method for game loop
	//
	self.update = function()
	{
		_modeObj.update();
	}


	//
	// render method for game loop
	//
	self.render = function()
	{
		_modeObj.render();
	}

	return self;
}

