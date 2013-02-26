//
// GuiSystem - manages gui elements and their events
//


Engine.GuiSystem = function(gameObject)
{
	var self = this;

	// same scenes, but for gui elements
	this.scenes = {}

	// render pipe
	//this._rp = gameObject && gameObject.rp;

	var _rp = gameObject && gameObject.rp,
		_itemUnderCursor = null;

	//
	// get gui item which is under given coordinates at the moment
	//
	//
	//
	function _getTopItemUnderCursor(x, y, anyItem)
	{
		var scene = gameObject.scene();

		// searching for affected gui element
		var items = _rp.getItems({scenes: [scene], instances: [Engine.GuiButton]});
		for (var i = 0, max = items.length; i < max; i += 1) {
			var item = items[i];

			if (anyItem) {
				var itemX = item.x() - item.width() / 2;
				var itemY = item.y() - item.height() / 2;
				if (x > itemX && y > itemY &&
						x < itemX + item.width() && y < itemY + item.height()) {

					_itemUnderCursor = item;
					return item;
				}
			}
		}

		return false;
	}


	//
	// shortcut method to add gui items to render pipe
	//
	// @chainable
	// @param Object/Object[] items - item or array of items
	// @param string scene - scene name (if not given, current scene is used)
	// @param string layer - layer name (if not given, default scene's layer is used)
	//
	this.addToRenderPipe = function(items, scene, layer)
	{
		if (!items) {
			throw new Error("Can not add falsy item to render pipe!");
		}

		_rp.addItem(items, scene, layer);
		return this;
	}


	//
	// process mouse move event
	//
	// @chainable
	// @param Event e - mouse event
	//
	this.processMouseMove = function(e)
	{
		var item = null;
		// handling onOut()
		if (_itemUnderCursor) {
			item = _getTopItemUnderCursor(e.clientX, e.clientY, true);
			if (item === _itemUnderCursor) {
				// we are still on same element, no need to proceed more
				return self;
			}
			_itemUnderCursor.getEventManager().fire('out', _itemUnderCursor);
			_itemUnderCursor = null;
		}

		if (!this._itemUnderCursor) {
			item = _getTopItemUnderCursor(e.clientX, e.clientY, true);

			if (item) {
				item.getEventManager().fire('hover', item);
			}
		}

		return self;
	}


	//
	// process mouse click event
	//
	// @chainable
	// @param Event e - mouse event
	//
	this.processMouseClick = function(e)
	{
		if (!_itemUnderCursor) {
			// search clickable item
			_getTopItemUnderCursor(e.clientX, e.clientY, true);
		}

		if (_itemUnderCursor) {
			_itemUnderCursor.getEventManager().fire('click', _itemUnderCursor);
		}

		return self;
	}
}
