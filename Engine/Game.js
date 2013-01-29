//
// Game World
//


//
// constructor
//
// @param string - canvas id
//
Engine.Game = function (canvasElem)
{
	var self = this;
	var _updateInterval = 0,
		_renderInterval = 0,
		_fps = 50,
		_timeouts = {};

	self.canvas = document.getElementById(canvasElem);

	self.rp = new Engine.RenderPipe();
	self.collisions = new Engine.Collisions();

	self.rp.on('createscene', function(rp, sceneName) {
		// create timeout for scene
		_timeouts[sceneName] = {};
	});

	//
	// game loop update function
	//
	function _update()
	{
		if (!self.getEventManager().fire('beforeupdate', self, self)) {
			return false;
		}

		self.rp.update();
		self.getEventManager().fire('update', self, self);
		self.collisions.check(self.scene());
		return true;
	}

	//
	// game render function
	//
	function _render()
	{
		if (!self.getEventManager().fire('beforerender', self, self)) {
			return false;
		}

		self.rp.render();
		self.getEventManager().fire('render', self, self);
		return true;
	}

	// resource manager
	this.ssm = new Engine.SpritesheetManager(self.canvas);

	// sound manager
	this.sm = new Engine.SoundManager();

	// namespace for usable game entities
	this.ent = {};

	// namespace for backgrounds
	this.bg = {};

	// events
	Engine.EventManagerMixin(self);
	self.registerEvents([
		"beforescenechange", "scenechange",
		"beforestart", "start",
		"beforeupdate", "update",
		"beforerender", "render"
	]);

	// register mouse events for manager
	var mouseEvents = ['mousemove', 'mousedown', 'mouseup', 'mouseout', 'click'];
	self.registerEvents(mouseEvents);
	for (var i = 0, max = mouseEvents.length; i < max; i += 1) {
		var evt = mouseEvents[i];
		(function(evtName, e) {
			self.canvas.addEventListener(evtName, function(e) {
				self.getEventManager().fire(evtName, self, self, e);
			});
		})(evt);
	}

	// register keyboard events for manager
	var kbEvents = ['keydown', 'keyup', 'keypress'];
	self.registerEvents(kbEvents);
	for (i = 0, max = kbEvents.length; i < max; i += 1) {
		evt = kbEvents[i];
		(function(evtName, e) {
			window.addEventListener(evtName, function(e) {
				self.getEventManager().fire(evtName, self, self, e);
			});
		})(evt);
	}

	//
	// PUBLIC
	//
	self.KEY_ESCAPE = 27;

	//
	// change or get current scene
	//
	// @chainable
	// @param string sceneName - scene name
	// @return string
	//
	self.scene = function(sceneName)
	{
		if (sceneName !== undefined) {
			if (self.rp.currScene != sceneName) {
				var oldScene = self.rp.currScene;
				if (!self.getEventManager().fire('beforescenechange', self, oldScene, sceneName)) {
					// canceled by event
					return self;
				}

				// pause current scene timeouts
				self.pauseAllTimeouts();

				self.rp.currScene = sceneName;

				// restore previous timeouts of new scene
				self.resumeAllTimeouts();

				self.getEventManager().fire('scenechange', self, oldScene, sceneName);
				return self;
			}
		}

		return self.rp.currScene;
	}


	//
	// game loop start
	//
	// @chainable
	// @param int fps - fps value (optional)
	//
	self.start = function(fps)
	{
		if (!self.getEventManager().fire('beforestart', self)) {
			return self;
		}

		if (fps) {
			_fps = fps;
		}

		_updateInterval = setInterval(_update, 1000 / _fps);
		_renderInterval = setInterval(_render, 1000 / _fps);

		self.getEventManager().fire('start');
		return self;
	}


	//
	// adds special timeout to current scene, which can be paused
	//
	// @chainable
	// @param string name - timeout id
	// @param function callback - function which will be executed after timeout
	// @param int timeout - timeout in miliseconds
	//
	self.addTimeout = function(name, callback, timeout)
	{
		var scene = self.rp.currScene;
		//if (_timeouts[scene] === undefined) {
		if (!(scene in _timeouts)) {
			_timeouts[scene]= {};
		}

		_timeouts[scene][name] = {
			id: setTimeout(callback, timeout),
			started: (new Date()).getTime(),
			left: 0,
			timeout: timeout,
			callback: callback
		}

		return self;
	}


	//
	// pauses timeout
	//
	// @chainable
	// @param string name - timeout id
	// @return bool
	//
	self.pauseTimeout = function(name)
	{
		var scene = self.rp.currScene;
		//if (this._timeouts[scene] == undefined) {
		if (!(scene in _timeouts)) {
			throw new Error(Engine.Util.format("No such timeout '{0}'", scene));
		}

		if (_timeouts[scene][name] != undefined && _timeouts[scene][name].id) {
			var tm = _timeouts[scene][name];
			clearTimeout(tm.id);
			tm.id = 0;
			tm.left = tm.timeout - ((new Date()).getTime() - tm.started) / 1000;

			if (tm.left <= 0) {
				console.log(Engine.Util.format("Removing old timeout '{0}' at pauseTimeout", name));
				delete _timeouts[scene][name];
			}
		}

		return self;
	}


	//
	// resumes timeout
	//
	// @chainable
	// @param string name - timeout's id
	//
	self.resumeTimeout = function(name)
	{
		var scene = self.rp.currScene;
		if (!(scene in _timeouts)) {
			throw new Error(Engine.Util.format("No such timeout '{0}'", scene));
		}

		if (_timeouts[scene][name] != undefined) {
			var tm = _timeouts[scene][name];
			tm.id = setTimeout(tm.callback, tm.left);
		}

		return self;
	}


	//
	// removes timeout
	//
	// @chainable
	// @param sring name - timeout's id
	// @param bool leaveId - if true - keep timeout object with given id
	//
	self.clearTimeout = function(name, leaveId)
	{
		var scene = self.rp.currScene;
		if (!(scene in _timeouts)) {
			throw new Error(Engine.Util.format("No such timeout '{0}'", scene));
		}

		if (_timeouts[scene][name] != undefined && _timeouts[scene][name].id) {
			var tm = _timeouts[scene][name];
			clearTimeout(tm.id);
		}

		if (!leaveId) {
			delete _timeouts[scene][name];
		}

		return self;
	}


	//
	// pause all scene's timeouts
	//
	// @chainable
	//
	self.pauseAllTimeouts = function()
	{
		var scene = self.rp.currScene;
		if (!scene) {
			return self;
		}
		if (!(scene in _timeouts)) {
			throw new Error(Engine.Util.format("No such timeout '{0}'", scene));
		}

		for (var tm in _timeouts[scene]) {
			self.pauseTimeout(tm);
		}

		return self;
	}


	//
	// resume all scene's timeouts
	//
	// @chainable
	//
	self.resumeAllTimeouts = function()
	{
		var scene = self.rp.currScene;
		if (!scene) {
			return self;
		}
		if (!(scene in _timeouts)) {
			throw new Error(Engine.Util.format("No such timeout '{0}'", scene));
		}

		for (var tm in _timeouts[scene]) {
			self.resumeTimeout(tm);
		}

		return self;
	}


	//
	// clears all timeouts
	//
	// @chainable
	//
	self.clearAllTimeouts = function()
	{
		var scene = self.rp.currScene;
		if (!scene) {
			return self;
		}
		if (!(scene in _timeouts)) {
			throw new Error(Engine.Util.format("No such timeout '{0}'", scene));
		}

		for (var tm in _timeouts[scene]) {
			self.clearTimeout(tm, true);
		}
		_timeouts[scene] = {};

		return self;
	}


	self.getTimeouts = function()
	{
		return _timeouts;
	}


	//
	// return current frames per second
	//
	// @return int
	//
	self.getFps = function()
	{
		return _fps;
	}


	//
	// set fps
	//
	// @chainable
	//
	self.setFps = function(fps)
	{
		_fps = fps;
		return self;
	}

	return self;
}
