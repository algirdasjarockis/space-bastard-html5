
SB.level.setData({
	no: 1,
	resources: {
		sprites: ['ammo', 'enemies', 'powerups'],
		sounds: [
			// 1st element is for main level theme sound, it's handle allways be 'level<levelNo>'
			'sounds/level0.wav',
			// next sounds are custom and should be passed as object straight to SoundManager.load()
			{handle: 'myCustomSound', path: 'sounds/level0.wav', loop: false}
		],
		bg: "img/backgrounds/bg3.jpg"
	},

	waves: [
		{
			duration: [5000, 6500],
			ai: [
				function(lvl) {
					lvl.spawnPowerup({x: 100, y: 300});
					for (var i = 0; i < 3; i += 1) {
						lvl.spawnEnemy({
							name: 'enemy3', x: 100 + 100 * i, y: -20,
							movement: [{x: 100 + 100 * i, y: 200}, {x: 100 + 100 * i, y: 100}, "scroll-x"]
						}).on('waypointend', function(enemy, waypointNo) {
							console.log('WAYPOINT END', waypointNo);
						});

						lvl.spawnEnemy({
							name: "enemy4", x: 100 + 100 * i, y: -20,
							movement: ["kamikaze"],
							autoShooting: false
						})
						// watch out self healing enemy :D
						.on('healthchange', function f(enemy) {
							// run away tactics
							enemy.setMovement(['scroll-x'])
								.set({autoShooting: true})
								.off('healthchange', f)
								// self heal
								.on('scrollxsidechange', function() {
									enemy.set({maxHealth: 500, health: 500});
								});
						});
					}
				}
			]
		},

		{
			finished: function(lvl) {
				return (SB.level.ns.enemyWhichMustDie.health <= 0);
			},
			ai: [
				function(lvl) {
					lvl.ns.enemyWhichMustDie = lvl.spawnEnemy({name: "enemy6", x: 300, y: 100, movement: ["scroll-x"]});
				}
			]
		},

		{
			duration: [5000, 6500],
			ai: [
				function(lvl) {
					lvl.spawnEnemy({
						name: "enemy1", x: 400, y: 10, movement: [{x: 100, y: 400}]
					});
					lvl.spawnEnemy({
						name: "enemy1", x: -20, y: -20,
						movement: [{x: SB.game.canvas.width + 20, y: SB.game.canvas.height + 20}]
					});
					lvl.spawnEnemy({
						name: "enemy1", x: SB.game.canvas.width + 20, y: -20,
						movement: [{x: -20, y: SB.game.canvas.height + 20}]
					});
				}
			]
		},

		{
			finished: function() {
				return (SB.level.enemyWhichMustDie.health <= 0);
			},
			ai: [
				function(lvl) {
					// do nothing
					lvl.enemyWhichMustDie = lvl.spawnEnemy({
						name: "enemy1", x: 400, y: 50, movement: ["scroll-x"]
					});
				}
			]
		},
	]
});
