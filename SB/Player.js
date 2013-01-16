//
// Player class - it handles some player specific data, like score, lives, powerups,
// HUD information, input events, driving hero ship and so on...
//

SB.Player = function()
{
	var self = this;
	var _hero = SB.game.ent.hero;
	var _shooting = false;

	this.score = 0;
	this.level = 1;
	this.ammo = 0;

	// mixins
	Engine.ObjectHelperMixin(this);

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
