
Engine.Resources.SpriteSheet({
	id: 'enemies',
	path: "img/sprites/enemies.png",
	sprites: {
		enemy1: {
			actions: {
				main: {
					x: 0, y: 0,
					w: 24, h: 26,
					fc: 4,
					repeat: 0
				}
			}
		},
		enemy2: {
			actions: {
				main: {
					x: 0, y: 28,
					w: 24, h: 24,
					fc: 3,
					repeat: 0
				}
			}
		},
		enemy3: {
			actions: {
				main: {
					alpha: 0.75,
					x: 74, y: 29,
					w: 24, h: 24,
					fc: 3,
					repeat: 0
				}
			}
		},
		enemy4: {
			actions: {
				main: {
					x: 147, y: 29,
					w: 24, h: 22,
					fc: 4,
					repeat: 0
				}
			}
		},
		enemy5: {
			skip: 10,
			actions: {
				main: {
					x: 0, y: 54,
					w: 48, h: 50,
					fc: 6,
					repeat: 0
				}
			}
		},
		enemy6: {
			actions: {
				main: {
					x: 0, y: 109,
					w: 48, h: 39,
					fc: 3,
					repeat: 0
				}
			}
		},
		enemy7: {
			actions: {
				main: {
					x: 0, y: 148,
					w: 97, h: 57,
					fc: 3,
					repeat: 0
				}
			}
		},
		bomb1: {
			actions: {
				main: {
					x: 146, y: 104,
					w: 48, h: 37,
					fc: 3,
					repeat: 0
				}
			}
		},
		boss1: {
			actions: {
				main: {
					x: 287, y: 45,
					w: 154, h: 151,
					fc: 1,
					repeat: 0
				}
			}
		},
        explosion: {
			actions: {
				main: {
					x: 0,
					y: 266,
					w: 44,
					h: 57,
					fc: 8,
					repeat: 0
				}
			}
        }
	}
});
