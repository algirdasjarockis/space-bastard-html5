//
// All sprite, collision, physics data for hero ship
//

Engine.EntityEx.load({
	name: 'hero',

	// rotation points
	rpoints: {
		a: {x: 0, y: -20},
		b: {x: 0, y: -10},

		// this is mass center point, most important one
		c: {x: 0, y: 0}
	},

	sprites: [
		{
			name: "hero",
			body: true,
			x: 0, y: 0,
			rot: 0
		},
		{
			name: "ammo1",
			body: false,
			x: 30, y: 0,
			rot: Math.PI / 180 * 45
		},
		{
			name: "ammo1",
			body: false,
			x: -30, y: 0,
			rot: -Math.PI / 180 * 45
		}
	],

	// collision points, soooon ...
	cpoints: [

	]
});
