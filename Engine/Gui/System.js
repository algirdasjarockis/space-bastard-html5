//
// GuiSystem - manages gui elements and their events
//


Engine.GuiSystem = function(gameObject)
{
	// same scenes, but for gui elements
	this.scenes = {}

	// game object
	this._world = gameObject;

	// render pipe
	this._rp = this._world && this._world.rp;

	// last gui element under cursor
	this._itemUnderCursor = null;
}


//
// add item to render pipe
//
// @chainable
// @param Object item - gui object
// @param string scene - scene name (if not given, current scene is used)
//
Engine.GuiSystem.prototype.addItem = function(item, scene)
{
	if (!scene) {
		scene = this._world.scene();
		if (!scene) {
			throw new Error("No selected scene!");
		}
	}

	if (this.scenes[scene] === undefined) {
		this.scenes[scene] = [];
	}

	this.scenes[scene].push(item);
	this._rp.addItem(item, scene);

	return this;
}


Engine.GuiSystem.prototype.onMouseMove = function(e)
{
	var item = null;
	// handling onOut()
	if (this._itemUnderCursor) {
		item = this._getTopItemUnderCursor(e.clientX, e.clientY, true);
		if (item === this._itemUnderCursor) {
			// we are still on same element, no need to proceed more
			return;
		}
		this._itemUnderCursor.getEventManager().fire('out', this._itemUnderCursor);
		this._itemUnderCursor = null;
	}

	if (!this._itemUnderCursor) {
		item = this._getTopItemUnderCursor(e.clientX, e.clientY, true);

		if (item) {
			//item.onHover();
			item.getEventManager().fire('hover', item);
		}
	}
}


Engine.GuiSystem.prototype.onClick = function(e)
{
	if (!this._itemUnderCursor) {
		// search clickable item
		this._getTopItemUnderCursor(e.clientX, e.clientY, true);
	}

	if (this._itemUnderCursor) {
		this._itemUnderCursor.getEventManager().fire('click', this._itemUnderCursor);
	}
}


Engine.GuiSystem.prototype._getTopItemUnderCursor = function(x, y, anyItem)
{
	var scene = this._world.scene();

	// searching for affected gui element
	for (var i = this.scenes[scene].length - 1; i >= 0; i -= 1) {
		var item = this.scenes[scene][i];

		if ((anyItem && !(item instanceof Engine.Background) && !(item instanceof Engine.GuiPointer)) ||
				(typeof(item.onHover) == "function" || typeof(item.onClick) == "function")) {

			var itemX = item.x();
			var itemY = item.y();
			if (x > itemX && y > itemY &&
					x < itemX + item.width() && y < itemY + item.height()) {

				//item.onHover();
				this._itemUnderCursor = item;
				return item;
			}
		}
	}

	return false;
}