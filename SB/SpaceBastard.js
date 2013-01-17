//
// Global game object
//

var SB = {
	canvasId: '',
	game: null,
	gui: null,
	player: null,
	level: null,

	ammoData: [
		{
			"sprite": "ammo1",
			"damage": 20,
			"velocity": 8,
			"ratio": 4,
			"angles": [90]
		},

		{
			"sprite": "ammo1",
			"damage": 20,
			"velocity": 8,
			"ratio": 4,
			"angles": [87, 93]
		},

		{
			"sprite": "ammo1",
			"damage": 20,
			"velocity": 8,
			"ratio": 4,
			"angles": [90, 60, 120]
		},

		{
			"sprite": "ammo1",
			"damage": 20,
			"velocity": 8,
			"ratio": 4,
			"angles": [90, 75, 90 + 90 - 75, 45, 90 + 90 - 45]
		}
	],

	enemyData: {
		enemy1: {
			sprite: 'enemy1',
			health: 100,
			ammo: {
				sprite: "enemyAmmo1",
				damage: 20,
				velocity: -3,
				ratio: 0.5,
				angles: [90]
			}
		},
		enemy2: {
			sprite: "enemy2",
			health: 150,
			ammo: {
				sprite: "enemyAmmo1",
				damage: 5,
				velocity: -7,
				ratio: 2,
				angles: [90]
			}
		},
		enemy3: {
			sprite: "enemy3",
			health: 75,
			ammo: {
				sprite: "enemyAmmo1",
				damage: 75,
				velocity: -9,
				ratio: 0.25,
				angles: [90]
			}
		},
		enemy4: {
			sprite: "enemy4",
			health: 75,
			ammo: {
				sprite: "enemyAmmo1",
				damage: 50,
				velocity: -3,
				ratio: 1,
				angles: [90]
			}
		},
		enemy5: {
			sprite: "enemy5",
			health: 2000,
			ammo: {
				sprite: "ammo1",
				damage: 150,
				velocity: 8,
				ratio: 4,
				angles: [90]
			}
		},
		enemy6: {
			sprite: "enemy6",
			health: 1300,
			ammo: {
				sprite: "enemyAmmoMine",
				damage: 200,
				velocity: -3,
				ratio: 1.5,
				angles: [85, 95]
			}
		},
		enemy7: {
			sprite: "enemy7",
			health: 3000,
			ammo: {
				sprite: "enemyAmmo1",
				damage: 50
			}
		},
		boss1: {
			sprite: "boss1",
			health: 8000,
			ammo: {
				sprite: "enemyAmmo1",
				damage: 250
			}
		}
	},


	//
	// create gui elements
	//
	createGuiEntities: function()
	{
		var self = this,
			game = self.game;

		// main menu
		game.scene("main-menu");
		game.ent.buttonStart = new Engine.GuiButton("menuButton1", game);
		game.ent.buttonStart
			.x(600).y(240)
			.set({
				text: "Start",
				captionFont: {
					normal: "20px Arial",
					hover: "20px Arial bold"
				},
				captionColor: {
					normal: "#ffffff",
					hover: "#ff0000"
				},
				captionAlign: "center",
				captionMargin: {
					top: 0, right: 0, bottom: 0,
					left: -10
				}
			})
			.on('click', function() {
				game.sm.play("click");
				game.scene('loading-screen');
				SB.level.load(1, function() {
					SB.createEnvironment();
					self.player = new SB.Player()
						.set({hero: game.ent.hero, score: 0});
					//game.scene('main');
				});
			});

		game.ent.pointer = new Engine.GuiPointer("pointer", game);
		SB.gui.addItem(game.bg.mainMenu)
			.addItem(game.ent.buttonStart)
			.addItem(game.ent.pointer);

		// pause menu
		//SB.gui.addItem(game.bg.main, "pause-menu");

		// back to main scene
		game.scene("main");
	},


	//
	// load resources for start window and create some gui stuff
	//
	load: function(callback)
	{
		var self = this,
			game = self.game,
			rp = game.rp;

		// render pipeline for game
		rp.createScene("main")
			// render pipeline for main menu scene
			.createScene("main-menu")
			// render pipeline for pause menu
			.createScene("pause-menu")
			// level loading animation
			.createScene("loading-screen");

		// load sprite sheets
		var spriteSheetDir = "img/sprites/";
		game.ssm.setDir(spriteSheetDir)
			.load(['gui/buttons', 'gui/elements', 'hero'], function(ssm) {
				// all spritesheets loaded, create entities
				self.createGuiEntities();
				callback();
			});

		// background
		game.bg.mainMenu = new Engine.Background(game.canvas)
			.load("img/sprites/gui/start.jpg");

		game.bg.doors = new Engine.Background(game.canvas)
			.load('img/backgrounds/doors.jpg')
			.setMode('curtain', {
				type: 'horizontal',
				speed: 10
			})
			.on('load', function(bg) {
				game.rp.addItem(bg, 'loading-screen');
			})
			.on('finish', function(bg) {
				console.log('BACKGROUND FINITO!');
				game.scene('main');
				bg.reinit();
			})

		// sounds
		game.sm.load({handle: 'mainTheme', path: 'sounds/main-theme.wav', loop: true, autoPlay: true})
			.load({handle: 'click', path: 'sounds/menu_click.wav'})
			.load({handle: 'pause0', path: 'sounds/pause-theme0.wav', loop: true})
			.load({handle: 'pause1', path: 'sounds/pause-theme1.WAV', loop: true})
			.load({handle: 'pause2', path: 'sounds/pause-theme2.wav', loop: true})
			.load({handle: 'pause3', path: 'sounds/pause-theme3.wav', loop: true})
			.load({handle: 'pulse', path: 'sounds/pulse.wav'})
			.load({handle: 'explosionStrong', path: 'sounds/explosion-strong.wav'})
			.volume('', 0.05); // set very low volume for a while :)
	},


	//
	// game init - main entry point of game
	//
	init: function(canvasId)
	{
		var self = this;
		self.canvasId = canvasId;
		self.game = new Engine.Game(self.canvasId);

		// load all resources and create all entities needed for start menu
		self.load(function() {
			// set starting scene
			self.game.scene("main-menu");
			self.game.on('scenechange', self.onSceneChange);

			// start all loops here
			self.game.start();
		});

		// create gui system
		self.gui = new Engine.GuiSystem(self.game);

		// create level object but do not load it
		self.level = new SB.Level();
		self.level
			.on('load', self.onLevelLoad)
			.on('finish', self.onLevelFinished);

		// init controls
		self.initMouse();
		self.initKeyboard();
	},


	//
	// init mouse behaviour callbacks on various scenes
	//
	initMouse: function()
	{
		var self = this;
		self.game
			.on('mousemove', function(game, e) {
				switch (game.scene()) {
				case 'main':
					break;

				case 'main-menu':
				case 'pause-menu':
					game.ent.pointer.x(e.clientX).y(e.clientY);
					self.gui.onMouseMove(e);
					break;
				}
			})
			.on('mouseout', function(game, e) {
				switch (game.scene()) {
				case 'main':
					game.scene('pause-menu');
					break;
				}
			})
			.on('click', function(game, e) {
				switch (game.scene()) {
				case 'main-menu':
				case 'pause-menu':
					self.gui.onClick(e);
					break;
				}
			});
	},


	//
	// init keyboard handling on various scenes
	//
	initKeyboard: function()
	{
		var self = this;
		self.game.on('keydown', function(game, e) {
			switch (e.keyCode) {
			case game.KEY_ESCAPE:
				if (game.scene() == "main") {
					game.scene("pause-menu");
				}
				else if (game.scene() == "pause-menu") {
					game.scene("main");
				}
				break;
			}
		});
	},


	//
	// create environment and gui elements for game loop
	//
	createEnvironment: function()
	{
		var game = this.game;
		// main game loop entities
		//SB.gui.addItem(game.bg.main, "main");
		SB.gui.addItem(SB.level.bg, 'main');

		// create gui for pause menu
		SB.gui.addItem(SB.level.bg, 'pause-menu');
		game.ent.pauseMenuBtn1 = new Engine.GuiButton("pauseMenuBtn1", game);
		game.ent.pauseMenuBtn1.captionColor.hover = "#555555";
		game.ent.pauseMenuBtn1.captionMargin.left = -10;
		game.ent.pauseMenuBtn1.x(600).y(240)
			.set({
				captionAlign: 'center',
				text: 'Back',
				captionFont: {
					normal: "20px Arial",
					hover: "20px Arial bold"
				}
			})
			.on('click', function() {
				game.sm.play("click");
				game.scene("main");
			})

		SB.gui.addItem(game.ent.pauseMenuBtn1, "pause-menu")
			.addItem(game.ent.pointer, "pause-menu");

		// our bastard hero
		//game.ent.hero = new Engine.Entity(game.rm._sprites.hero, game);
		game.ent.hero = SB.GameEntity(new Engine.Entity("hero", game)
			.set({type: 'hero', maxHealth: 1000, health: 1000, weight: 200})
			.addToRenderPipe('main')
			.on('collide', function(item) {
				//this.removeFromCollisions();
				if (item.type == "enemy") {
					this.addHealth(-(item.weight / this.weight * this.maxHealth));
				}
				else if (item.type == "ammo") {
					this.addHealth(-item.damage);
					item.removeFromCollisions()
						.removeFromRenderPipe();
				}
				else if (item.type == "powerup") {
					var powerup = item;
					item.removeFromCollisions()
						.removeFromRenderPipe();
					SB.onPowerupTake(powerup);
				}
			})
			.on('die', function() {
				game.scene("main-menu");
			})
			.on('lastframe', function() {
				// respawn
				// this refers to Engine.Sprite!
				if (this.action == "explode") {
					this.action = "main";
					game.ent.hero.addToCollisions("friends");
				}
			}));

		// hero is invincible for some time
		setTimeout(function() {
			game.ent.hero.addToCollisions("friends");
		}, 3000);


		// other useful items
		game.ent.label1 = new Engine.GuiLabel(game);
		game.ent.label1.set({
			x: 20, y: 20,
			width: 500,
			color: "#ffffff",
			font: "18px Tahoma",
			text: "0"
		});
		SB.gui.addItem(game.ent.label1, "main");

		game.ent.pg = new Engine.GuiProgress("progress", "progressStep", game);
		game.ent.pg.x(10).y(560);
		game.ent.pg.value = 100;
		game.ent.pg.on('update', function(pg) {
			pg.value = SB.player.hero.health / SB.player.hero.maxHealth * 100;
		});
		SB.gui.addItem(game.ent.pg, "main");
	},


	onLevelLoad: function()
	{
		console.log(Engine.Util.format("Level {0} loaded!", 1));
		SB.level.run();
	},


	onLevelStarted: function()
	{
		console.log(Engine.Util.format("Level {0} started!", this.getNumber()));
	},


	onLevelFinished: function()
	{
		console.log(Engine.Util.format("Level {0} finished!", this.getNumber()));
	},


	onEnemyDie: function(enemy)
	{
		SB.game.sm.play("explosionStrong");
		this.player.score += enemy.maxHealth;
		this.game.ent.label1.text = this.player.score;
	},


	onSceneChange: function(from, to)
	{
		var sc = from + "." + to;
		switch (sc) {
		case 'main-menu.loading-screen':
			SB.game.sm.pauseAll();
			break;
		case 'loading-screen.main':
			// game start
			console.log("go go go!");
			SB.game.sm.pause("mainTheme");
			SB.game.sm.play("level1");
			break;

		case 'main.main-menu':
			SB.game.ent.pointer.x(SB.game.ent.hero.x());
			SB.game.ent.pointer.y(SB.game.ent.hero.y());
			SB.game.removeSceneEntities('main');
			SB.game.sm.pauseAll();
			SB.game.sm.play("mainTheme");
			break;

		case 'main.pause-menu':
			SB.game.sm.pause("level1");
			SB.game.sm.play("pause" + Engine.Util.random(0, 3));
			break;

		case 'pause-menu.main':
			SB.game.sm.pauseAll();
			SB.game.sm.play("level1");
			break;
		}
	},


	onPowerupTake: function(powerup)
	{
		//console.log("I'VE GOT A POWER!");
		//console.log(powerup);
		this.player.ammo += 1;
	}
}