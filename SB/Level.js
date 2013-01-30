//
// Level Class
//

SB.Level = function() {
	var self = this;

	// privates
	var _levelNo = 0,
		_blockNo = 0,
		_lvlData = null,
		_lvlInterval = 0,
		_ssm = new Engine.SpritesheetManager();

	_ssm.setDir('img/sprites/');

	function _nextBlock()
	{
		return (_blockNo += 1);
	}


	var _onBeforeUpdate = null;


	//
	// process one wave block
	//
	function _processBlock()
	{
		console.log(">>>>> ", _lvlData);
		if (typeof(_lvlData.waves[_blockNo]) === "undefined") {
			return false;
		}
		var difficulty = 0;

		var wave = _lvlData.waves[_blockNo];
		var duration = 0;

		// getting AI func by current difficulty
		var aiFunc = null;
		try {
			aiFunc = wave.ai[difficulty];
		}
		catch (err) {
			// just get last if difficulty does not fit
			aiFunc = wave.ai[wave.ai.length - 1];
		}

		if (typeof(wave.finished) == 'function') {
			// it is conditional wave
			if (aiFunc) {
				SB.game.addTimeout("level_" + _blockNo, function() {
					aiFunc(self);
					_processCondition(wave.finished);
				}, _lvlInterval);
				_lvlInterval = 0;
			}
		}
		else {
			// it is timed wave
			// getting interval duration by difficulty
			try {
				duration = wave.duration[difficulty];
			}
			catch (err) {
				// out of bounds? get last item then!
				duration = wave.duration[wave.duration.length - 1]
			}

			if (aiFunc) {
				SB.game.addTimeout("level_" + _blockNo, function() {
					aiFunc(self);
				}, _lvlInterval);
			}

			// increase it more for next timeouts
			_lvlInterval += duration;

			//if ((_blockNo += 1) >= _lvlData.waves.length) {
			if (_nextBlock() >= _lvlData.waves.length) {
				// it's last block
				SB.game.addTimeout("level_finish", function() {
					self.getEventManager().fire('finish', self);
				}, _lvlInterval);
			}
			else {
				// continue to next block
				_processBlock();
			}
		}

		return true;
	}


	//
	// process conditional block
	//
	function _processCondition(callback)
	{
		if (typeof(callback) == 'function') {
			function onBeforeUpdate() {
				if (callback() === true) {
					// boss died
					console.log('BOSS DIED!');
					_onBeforeUpdate = null;
					SB.game.getEventManager().unregister('beforeupdate', onBeforeUpdate);

					//if ((_blockNo += 1) >= _lvlData.waves.length) {
					if (_nextBlock() >= _lvlData.waves.length) {
						console.log(_blockNo, _lvlData.waves);
						// it's last block
						self.getEventManager().fire('finish', self, self);
					}
					else {
						// continue to next block
						_processBlock();
					}
				}
			}

			_onBeforeUpdate = onBeforeUpdate;
			SB.game.on('beforeupdate', onBeforeUpdate);
		}
	}

	// public

	// Engine.Background instance
	self.bg = null;

	// namespace/container for level data, which will be emptied after level finish
	self.ns = {};

	// events
	Engine.EventManagerMixin(self);
	self.registerEvents(['beforeload', 'load', 'beforestart', 'start', 'finish', 'enemydie']);

	//
	// loads level
	//
	// @chainable
	// @param int levelNo - level number
	// @param Function callback - callback when loading complete
	//
	self.load = function(levelNo, callback)
	{
		_lvlData = null;
		_levelNo = levelNo;

		var path = "SB/levels/level" + levelNo + ".js";
		self.getEventManager().fire('beforeload', self, path);

		Engine.Util.loadJs(path, function() {
			self.bg = new Engine.Background(SB.game.canvas)
				// load background ...
				.load(_lvlData.resources.bg, function() {
					// ... and then sprites
					_ssm.load(_lvlData.resources.sprites, function() {
						// we call level onload here
						if (typeof(callback) == 'function') {
							callback();
						}
						self.getEventManager().fire('load', self);
					});
				})
				//.setMode('loop-y');
				.setMode('loop', {type: 'vertical'});

			// load sounds which probably (should) are cached by browser
			if (Engine.Util.isArray(_lvlData.resources.sounds)) {
				var sounds = _lvlData.resources.sounds,
					soundLen = sounds.length;

				SB.game.sm.load({handle: 'level' + levelNo, path: sounds[0], loop: true});

				if (soundLen > 1) {
					// wow, custom sounds! They can be used from level ai functions only
					// cause their handles won't be known for outside code
					for (var i = 1; i < soundLen; i += 1) {
						SB.game.sm.load(sounds[i]);
					}
				}
			}
		});

		return self;
	}


	//
	// Unloads level
	//
	self.unload = function()
	{
		_lvlData = null;
		_blockNo = 0;

		var path = "SB/levels/level" + _levelNo + ".js";
		Engine.Util.unloadJs(path);

		if(_onBeforeUpdate) {
			SB.game.getEventManager().unregister('beforeupdate', _onBeforeUpdate);
			_onBeforeUpdate = null;
		}
	}


	//
	//
	//
	self.getNumber = function()
	{
		return _levelNo;
	}


	//
	// set waves collection to level. It should be called in level files
	//
	// @chainable
	// @param Object data - level data
	//
	self.setData = function(data)
	{
		_lvlData = data;
		return self;
	}


	//
	// starts level
	//
	// @return bool
	//
	self.run = function()
	{
		if (!_lvlData) {
			console.log('Empty level!');
			return false;
		}

		if(_onBeforeUpdate) {
			SB.game.getEventManager().unregister('beforeupdate', _onBeforeUpdate);
			_onBeforeUpdate = null;
		}

		if (!self.getEventManager().fire('beforestart', self)) {
			return false;
		}

		if (_lvlData.waves.length > 0) {
			self.getEventManager().fire('start', self);
			_lvlInterval = 0;
			_blockNo = 0;
			_processBlock();
		}

		return true;
	}


	//
	// spawns enemy
	//
	// @param Object config - config object
	//		fields:
	//			string name - enemy name
	//			int x - x coord
	//			int y - y coord
	//			array movement - waypoints
	// @return Engine.Entity
	//
	self.spawnEnemy = function(config)
	{
		var defConfig = {
			name: 'enemy1',
			x: 0, y: 0,
			movement: []
		}

		config = Engine.Util.merge(defConfig, config);

		var game = SB.game;
		if (game.ent.level == undefined) {
			game.ent.level = [];
		}

		if (!(config.name in SB.enemyData)) {
			throw new Error(Engine.Util.format("No data for enemy '{0}'", config.name));
		}

		// create enemy
		var enemyData = SB.enemyData[config.name];
		var enemy = SB.GameEntity(new Engine.Entity(enemyData.sprite, game)
			.x(config.x).y(config.y)
			.set({
				health: enemyData.health,
				maxHealth: enemyData.health,
				weight: enemyData.weight,
				speed: 1,
				dx: 0, dy: 0,
				type: "enemy",
				movement: config.movement,
				autoShooting: config.autoShooting
			})
			.addToRenderPipe("main")
			.addToCollisions("enemies")
			.on('die', function() {
				//SB.onEnemyDie(enemy);
				self.getEventManager().fire('enemydie', self, self, enemy);

				this.removeFromRenderPipe();
				this.removeFromCollisions();

				var explosion = new Engine.Entity('explosion', game);
				explosion.x(this.x()).y(this.y())
					.scale(0.3 + Math.random())
					.on('lastframe', function() {
						explosion.removeFromRenderPipe();
					})
					.addToRenderPipe();
			})
			.on('collide', function(item) {
				if (item.type == "ammo") {
					this.addHealth(-item.damage);

					item.removeFromCollisions();
					item.removeFromRenderPipe();
				}
			})
			.on('update', function() {
				if ('ammo' in enemyData) {
					// whoa, it's armed!
					enemy.shoot(enemyData.ammo);
				}
			}));

		return enemy;
	}


	//
	// spawns powerup
	//
	// @param Object config - config object
	//		fields:
	//			string name - enemy name
	//			int x - x coord
	//			int y - y coord
	//			array movement - waypoints
	// @return Engine.Entity
	//
	self.spawnPowerup = function(config)
	{
		var game = SB.game;
		var defConfig = {
			name: 'powerupAmmo1',
			x: 0, y: 0
		}

		config = Engine.Util.merge(defConfig, config);

		return new Engine.Entity(config.name, game)
			.x(config.x).y(config.y)
			.set({type: 'powerup'})
			.addToRenderPipe("main")
			.addToCollisions("enemies")
			.on('update', function(powerup) {
				powerup.move(0, 0.5);
			})
	}

	return self;
}
