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

	var _img = null,
		_imgs = [],
		_x = 0, _y = 0;

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
            direction: 1,
            random: false,          // if multiple images are used, render them in random order
			alpha: 1.0
		}

		config = Engine.Util.merge(defConfig, config);

		var type = config.type || 'vertical',
			// if true, we need to draw "tail"
			tailActive = false,
			src = {
                imgi: config.random ? Engine.Util.random(0, _imgs.length - 1) : 0,
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
                imgi: config.random ? Engine.Util.random(0, _imgs.length - 1) : (_imgs.length > 1 ? 1 : 0),
				x: 0, y: 0,
				w: 0, h: 0
			},

			tailTarget = {
				x: 0, y: 0,
				w: target.w, h: 0
			},

			setNextImages = function()
			{
				var len = _imgs.length;
				if (len > 1) {
					if ((tailSrc.imgi += 1) >= len) {
						tailSrc.imgi = 0;
					}
					if ((src.imgi += 1) >= len) {
						src.imgi = 0;
					}
				}
			},

            setRandomImages = function()
            {
                var len = _imgs.length;
				src.imgi = tailSrc.imgi;
				tailSrc.imgi = Engine.Util.random(0, len - 1);

				console.log(tailSrc.imgi, src.imgi);
            },

			types = {
				vertical: function() {
					this.updateFunc = null;
					this.renderFunc = null;

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
						tailTarget.y = config.direction * -target.h;

						// update
						this.updateFunc = function(delta) {
							target.y += config.speed * config.direction * delta;
							tailTarget.y += config.speed * config.direction * delta;

							if ((config.direction < 0 && tailTarget.y <= 0) || (config.direction > 0 && tailTarget.y >= 0)) {
								// loop end, restart positions
								target.y = tailTarget.y;
								tailTarget.y = target.y + config.direction * -target.h;

								if (config.random) {
									setRandomImages();
								}
								else {
									setNextImages();
								}
							}
						}


						// render
						this.renderFunc = function() {
							_ctx.save();
								_ctx.globalAlpha = config.alpha;
								_ctx.drawImage(_imgs[src.imgi], src.x, src.y, src.w, src.h,
									target.x, target.y, target.w, target.h);

								// draw image "tail"
								_ctx.drawImage(_imgs[tailSrc.imgi], tailSrc.x, tailSrc.y,
									tailSrc.w, tailSrc.h,
									tailTarget.x, tailTarget.y, tailTarget.w, tailTarget.h);
							_ctx.restore();
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
							this.updateFunc = function(delta) {
								src.y += config.speed * direction * delta;

								if (src.y < 0) {
									src.y = 0;
									tailActive = true;
								}

								if (tailActive) {
									// reached image boundary
									if ((target.y += -(config.speed * direction * delta)) >= canvas.height) {
										// current image is fully hidden, we should reset some coords to restart loop
										tailActive = false;

										src.y = src.sy;
										target.y = 0;

                                        if (config.random) {
                                            setRandomImages();
                                        }
                                        else {
                                            setNextImages();
                                        }
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
						}
						else {
							// background moves to top
							src.sy = src.y = 0;
							target.y = 0;

							// update
							this.updateFunc = function(delta) {
								src.y += config.speed * direction * delta;

								if (_img.height - src.y < canvas.height) {
									target.h = src.h = _img.height - src.y;
									tailActive = true;
								}

								if (tailActive) {
									// reached image boundary
									if (target.h <= 0) {
										// current image is fully hidden, we should reset some coords to restart loop
										tailActive = false;

                                        if (config.random) {
                                            setRandomImages();
                                        }
                                        else {
                                            setNextImages();
                                        }

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
						}
					}

					this.update = this.updateFunc;
					if (this.renderFunc) {
						this.render = this.renderFunc;
					}
					else {
						this.render = function() {
							_ctx.save();
								_ctx.globalAlpha = config.alpha;
								_ctx.drawImage(_imgs[src.imgi], src.x, src.y, src.w, src.h,
									target.x, target.y, target.w, target.h);

								if (tailActive) {
									// draw image "tail"
									_ctx.drawImage(_imgs[tailSrc.imgi], tailSrc.x, tailSrc.y,
										tailSrc.w, tailSrc.h,
										tailTarget.x, tailTarget.y, tailTarget.w, tailTarget.h);
								}
							_ctx.restore();
						};
					}
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
		this.update = function(delta)
		{
			loopObj.update(delta);
		}


		//
		// mode render function
		//
		this.render = function(delta)
		{
			loopObj.render(delta);
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
					this.update = function(delta) {
						if (finished) {
							return;
						}

						if (leftX < width) {
							leftX += config.speed * delta;
						}
						else {
							leftX = width;
							finished = true;
						}

						if (rightX > width) {
							rightX -= config.speed * delta;
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
		this.update = function(delta)
		{
			curtainObj.update(delta);
		}


		//
		// mode render function
		//
		this.render = function(delta)
		{
			curtainObj.render(delta);
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
			throw new Error("URL(s) of image was not given");
		}

		var urls = [];
		if (!Engine.Util.isArray(imgUrl)) {
			urls = [imgUrl];
		}
		else {
			urls = imgUrl;
		}

		var loaded = 0;
		for (var i = 0, max = urls.length; i < max; i += 1) {
			_imgs[i] = new Image();
			_imgs[i].onload = function() {
				if ((loaded += 1) >= urls.length) {
					if (typeof(callback) == 'function') {
						callback.apply(self, self);
					}

					self.getEventManager().fire('load', self, self);
				}
			}
			_imgs[i].src = urls[i];
		}

		_img = _imgs[0];
		return self;
	}


	//
	// update method for game loop
	//
	self.update = function(delta)
	{
		_modeObj.update(delta);
	}


	//
	// render method for game loop
	//
	self.render = function(delta)
	{
		_modeObj.render(delta);
	}

	return self;
}

