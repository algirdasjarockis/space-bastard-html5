//
// Render pipeline - collection of drawable objects
//

Engine.RenderPipe = function()
{
	var self = this;
    // collection of scenes
    this.rp = {};

    // current usable scene
    this.currScene = "";

	// flag that means we are in rendering loop at the moment
	this._rendering = false;

	// objects that must be destroyed later
	this._garbage = [];

	Engine.EventManagerMixin(self);
	self.registerEvents(['createscene']);
}


//
// adds separate scene
//
// @chainable
// @param string name - scene name
//
Engine.RenderPipe.prototype.createScene = function(name)
{
	this.rp[name] = [];
	if (this.currScene != "") {
		this.currScene = name;
	}

	this.getEventManager().fire('createscene', this, this, name);

	return this;
}


//
// adds renderable item (object must have .render() and .update() methods)
//
// @chainable
// @param Object item - object to display
// @param string sceneName - scene name, if not given - current scene
//
Engine.RenderPipe.prototype.addItem = function(item, sceneName)
{
	if (!sceneName) {
		sceneName = this.currScene;
	}

	if (!(sceneName in this.rp)) {
		throw new Error(Engine.Util.format("No such scene '{0}'", sceneName));
	}

	this.rp[sceneName].push(item);
	return true;
}


//
// removes item from render pipe
//
// @chainable
// @param Object item - item for removal
// @return bool
//
Engine.RenderPipe.prototype.removeItem = function(item, sceneName)
{
	// remove only if it's safe
	if (!this._rendering) {
		if (!sceneName) {
			sceneName = this.currScene;
		}

		var pos = this.rp[sceneName].indexOf(item);
		if (pos != -1) {
			var start = this.rp[sceneName].slice(0, pos);
			var end = this.rp[sceneName].slice(pos + 1);
			this.rp[sceneName] = start.concat(end);

			return this;
		}
	}
	else {
		this._garbage.push(item);
	}

    return this;
}


//
// renders all current scene's items
//
// @chainable
//
Engine.RenderPipe.prototype.render = function()
{
	this._rendering = true;
	var sceneName = this.currScene;
	for (var i = 0, len = this.rp[sceneName].length; i < len; i += 1 ) {
		if (this.rp[sceneName][i]) {
			this.rp[sceneName][i].render();
		}
		else {
			console.log("NULL ITEM IN RENDER PIPE!");
		}
	}

	this._rendering = false;
	if (this._garbage.length > 0) {
		for (var k = 0, max = this._garbage.length; k < max; k++) {
			this.removeItem(this._garbage[k]);
		}

		this._garbage = [];
	}

	return this;
}


//
// remove all entities from given scene
//
// @chainable
// @param string sceneName - scene name
//
Engine.RenderPipe.prototype.clearScene = function(sceneName)
{
	/*
	for (var i = 0, len = this.rp[sceneName].length; i < len; i += 1 ) {
		this.removeItem(this.rp[sceneName][i], sceneName);
	}
	*/
	this.rp[sceneName] = [];
	return this;
}