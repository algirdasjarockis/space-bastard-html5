
Engine.Resources.SpriteSheet({
	id: 'gui/elements',
	path: "img/sprites/gui/elements.png",
	sprites: {
		pointer: {
			actions: {
				main: {
					x: 0,
					y: 0,
					w: 32,
					h: 32,
					fc: 1,
					repeat: 0
				}
			}
		},
		progress: {
			actions: {
				main: {
					x: 32,
					y: 6,
					w: 127,
					h: 20,
					border: 1,
					fc: 1,
					repeat: 0
				}
			}
		},
		progressStep: {
			actions: {
				main: {
					x: 159,
					y: 6,
					w: 5,
					h: 20,
					fc: 4,
					repeat: 0
				}
			}
		}
	}
});
