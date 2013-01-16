
Engine.Resources.SpriteSheet({
	id: 'ammo',
	path: "img/sprites/ammo.png",
	sprites: {
		ammo1: {
			actions: {
				main: {
					x: 0,
					y: 0,
					w: 8,
					h: 6,
					fc: 1,
					repeat: 0
				}
			}
		},

		ammo2: {
			actions: {
				main: {
					x: 0,
					y: 9,
					w: 9,
					h: 18,
					fc: 1,
					repeat: 0
				}
			}
		},

		ammoexplosion1: {
			actions: {
				main: {
					x: 2,
					y: 34,
					w: 16,
					h: 18,
					fc: 5,
					repeat: 0
				}
			}
		},

		enemyAmmo1: {
			actions: {
				main: {
					x: 119,
					y: 1,
					w: 8,
					h: 8,
					fc: 1,
					repeat: 0
				}
			}
		},

		enemyAmmoMine: {
			skip: 2,
			actions: {
				main: {
					x: 1,
					y: 53,
					w: 12,
					h: 9,
					fc: 10,
					repeat: 0
				}
			}
		}
	}
});


