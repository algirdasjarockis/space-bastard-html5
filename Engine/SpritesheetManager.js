
Engine.SpritesheetManager = function(canvas)
{
	var self = this;
	var _canvas = canvas;
	var _spriteDir = '';

	// events
	Engine.EventManagerMixin(self);
	self.registerEvents(['beforeload', 'load', 'loadall', 'error', 'ommit']);

	// callbacks for debug purpose, on real environment it should be removed
	self.on('load', function(path) {
			console.log('Loaded: ', path);
		})
		.on('error', function(path) {
			console.log('Could not load: ', path);
		})
		.on('beforeload', function(path) {
			//console.log('Loading: ', path);
		})
		.on('ommit', function(name, fullpath) {
			console.log(Engine.Util.format('{0}({1}) was ommited', name, fullpath));
		});

	//
	// loads spritesheet data files
	//
	// @chainable
	// @param String/Array pathnames - list of file paths
	// @param Function callback - callback which is called when all given paths were loaded
	//
	self.load = function(pathnames, callback)
	{
		if (!Engine.Util.isArray(pathnames)) {
			pathnames = [pathnames];
		}

		if (!callback) {
			callback = function () { return 0; }
		}

		var loadCount = 0;
		var bank = new Engine.Resources.SpriteSheet();
		for (var i = 0, max = pathnames.length; i < max; i += 1) {
			var path = _spriteDir + pathnames[i] + '.js';
			if (bank.spriteSheetExists(pathnames[i])) {
				self.getEventManager().fire('ommit', self, pathnames[i], path);
				loadCount += 1;
				if (loadCount === max) {
					callback(self, pathnames);
					self.getEventManager().fire('loadall', self, self, pathnames);
				}
				continue;
			}

			self.getEventManager().fire('beforeload', self, path);

			Engine.Util.loadJs(path,
				// success
				(function(filePath) {
					return function() {
						self.getEventManager().fire('load', self, filePath);
						loadCount += 1;
						if (loadCount === max) {
							callback(self, pathnames);
							//callback.apply(scope, [self, pathnames]);
							self.getEventManager().fire('loadall', self, self, pathnames);
						}
					}
				})(path),

				// error
				(function(filePath) {
					return function() {
						self.getEventManager().fire('error', self, filePath);
					}
				})(path)
			);
		}

		return self;
	}


	//
	// set dir containing sprite data
	//
	// @chainable
	// @param string path - path to dir
	//
	self.setDir = function(path)
	{
		_spriteDir = path;
		return self;
	}


	//
	// get sprite instance by it's name
	//
	// @param string spriteName - name of sprite
	//
	self.getSprite = function(spriteName)
	{
		var bank = new Engine.Resources.SpriteSheet();
		//if (spriteName in _sprites) {
		if (spriteName in bank.getSprites()) {
			// with .init() we make sure that sprite internals have access to canvas
			return bank.getSprite(spriteName).init(_canvas);
		}
		else {
			throw new Error(Engine.Util.format("No such sprite '{0}'!", spriteName));
		}
	}


	//
	// return all sprites
	//
	self.getSprites = function()
	{
		//return _sprites;
		return (new Engine.Resources.SpriteSheet()).getSprites();
	}
}