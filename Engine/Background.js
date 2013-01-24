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
			speed: 2
		}

		config = Engine.Util.merge(defConfig, config);

		var type = config.type || 'vertical',
			y = 0,
			types = {
				vertical: function() {
					this.update = function() {
						if ((y += 1) >= _img.height)
							y = 0;
					}

					this.render = function() {
						_ctx.drawImage(_img, 0, 0, _img.width, _img.height - y,
							0, y, canvas.width, canvas.height - y);

						_ctx.drawImage(_img, 0, _img.height - y,
							_img.width, y,
							0, 0, canvas.width, y);
					}
				}
			}

		if (!(type in types)) {
			throw new Error("No such type '{0}' for background curtain mode");
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
