//
// Player class - it handles some player specific data, like score, lives, powerups,
// HUD information, input events, driving hero ship and so on...
//

SB.Player = function()
{
	var self = this;
	var game = SB.game,
		_hero = null,
		_shooting = false;

	this.score = 0;
	this.level = 1;
	this.ammo = 0;

	// mixins
	Engine.ObjectHelperMixin(this);

	// our bastard hero
	_hero = game.ent.hero = SB.GameEntity(new Engine.Entity("hero", game)
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
			game.scene("game-over");
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

	// some event catching
	SB.game
		.on('mousedown', function(game, e) {
			if (game.scene() == 'main') {
				if (e.which == 1) {
					_shooting = true;
				}
				else if (e.which == 2) {
					self.ammo += 1;
				}
			}
		})
		.on('mouseup', function(game, e) {
			if (game.scene() == 'main') {
				if (e.which == 1) {
					_shooting = false;
				}
			}
		})
		.on('mousemove', function(game, e) {
			if (game.scene() == 'main') {
				_hero.x(e.clientX).y(e.clientY);
			}
		});

	_hero
		.on('update', function() {
			if (_shooting) {
				self.shoot();
			}
		})
		.on('shoot', function() {
			SB.game.sm.play("pulse");
		});

	//
	// perform hero shoot
	//
	this.shoot = function()
	{
		SB.ammoData[self.ammo].ratio = 4;
		SB.ammoData[self.ammo].side = 'friends';
		_hero.shoot(SB.ammoData[self.ammo]);
	}

	return self;
}
