//
// SoundManager - loads, plays sounds. Remember, there is no onload events yet,
// cause, Audio API uses preloading and it should be left so
//

Engine.SoundManager = function()
{
	var self = this;
	var _sounds = {};
	var _allVolume = undefined;


	//
	// play sound
	//
	// @chainable
	// @param string handle - handle name
	//
	self.play = function(handle)
	{
		if (!(handle in _sounds)) {
			throw new Error(Engine.Util.format("No such sound handle '{0}'", handle));
		}
		//_sounds[handle].currentTime = 0.0;
		_sounds[handle].play();

		return self;
	}


	//
	// pause all sounds and play only given one
	//
	// @chainable
	// @param string handle - handle name
	//
	self.playOne = function(handle)
	{
		self.pauseAll();
		self.play(handle);

		return self;
	}


	//
	// pause sound by given handle
	//
	// @chainable
	// @param string handle - handle name
	//
	self.pause = function(handle)
	{
		if (!(handle in _sounds)) {
			throw new Error(Engine.Util.format("No such sound handle '{0}'", handle));
		}

		_sounds[handle].pause();
		return self;
	}


	//
	// pause all sounds
	//
	// @chainable
	//
	self.pauseAll = function()
	{
		for (var i in _sounds) {
			_sounds[i].pause();
		}

		return self;
	}


	//
	// loads sound
	//
	// @chainable
	// @param Object config - params in object,
	//			fields:
	//				String handle - name of sound handle (required)
	//				String path - path to sound file (required)
	//				boolean loop - true for looping audio when playing
	//				boolean autoplay - true for play when file is loaded
	//
	self.load = function(config)
	{
		if (!('handle' in config)) {
			throw new Error("No handle given in SoundManager.load()");
		}
		if (!('path' in config)) {
			throw new Error("No file path given in SoundManager.load()");
		}

		var audio = _sounds[config.handle] = new Audio();
		audio.loop = config.loop;
		audio.autoplay = config.autoPlay;
		audio.src = config.path;

		if (_allVolume) {
			audio.volume = _allVolume;
		}

		return self;
	}


	//
	// Sets or gets volume for one sound or all loaded
	//
	// @chainable
	// @param string handle - handle name. If not set or is falsy value function operates with ALL sounds
	// @param float val - volume level in range [0, 1]. If not set, it returns current volume level
	//
	self.volume = function(handle, val)
	{
		if (handle && !(handle in _sounds)) {
			throw new Error(Engine.Util.format("No such sound handle '{0}'", handle));
		}
		else if (!handle && val) {
			// set volume for all sounds
			for (var h in _sounds) {
				_sounds[h].volume = val;
			}
			_allVolume = val;
			return self;
		}
		else if (!handle) {
			// return previously set volume level
			return _allVolume;
		}

		// set/get volume for one sound
		if (val) {
			_sounds[handle].volume = val;
			return self;
		}
		return _sounds[handle].volume;
	}
}

