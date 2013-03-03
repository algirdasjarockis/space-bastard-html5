
Engine.Resources.SpriteSheet({
	id: 'hero',
	path: "img/sprites/hero.png",
	sprites: {
		hero: {
			defaults: {
				alpha: 1
			},
			actions: {
				main: {
					x: 0,
					y: 0,
					w: 47,
					h: 38,
					fc: 3,
					repeat: 0
				},
				explode: {
					x: 0,
					y: 64,
					w: 64,
					h: 64,
					fc: 8,
					repeat: 1
				}
			}
		}
	}
});
