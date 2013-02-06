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

	var _rendering = false,
		_garbage = [];

	Engine.EventManagerMixin(self);
	self.registerEvents(['createscene']);


	//
	// Utility class for encapsulating pesky logics - represents Scene
	//
	// @constructor
	// @param Object config - some configuration for class, fields:
	//			@config Array layers - names of layers
	//			@config string defaultLayer - default layer name
	//
	function Scene(config)
	{
		var _layers = {},
			_defaultLayer = '',
			_order = [];

		// for debugging purposes
		this.getLayers = function()
		{
			return _layers;
		}


		//
		// create layer
		//
		// @chainable
		// @param string name - layer name
		//
		this.createLayer = function(name, zindex)
		{
			if (name) {
				_order.push(name);
				_layers[name] = [];

				if (!_defaultLayer) {
					// first created layer will be default
					_defaultLayer = name;
				}
			}
			else {
				throw new Error("Layer name can not be falsy value");
			}

			return this;
		}


		//
		// set given layer as default which will be used for new items
		//
		// @chainable
		// @param string name - layer name
		//
		this.setDefaultLayer = function(name)
		{
			if (!(name in _layers)) {
				throw new Error(Engine.Util.format("No such layer '{0}' to set as default", name));
			}

			_defaultLayer = name;

			return this;
		}


		//
		// return previously set default layer
		//
		// @return string
		//
		this.returnDefaultLayer = function()
		{
			return _defaultLayer;
		}


		//
		// adds renderable item (object must have .render() and .update() methods)
		//
		// @chainable
		// @param Object item - object to display
		// @param string sceneName - scene name, if not given - current scene
		//
		this.addItem = function(item, layer)
		{
			if (!layer) {
				layer = _defaultLayer;
			}

			if (!(layer in _layers)) {
				throw new Error(Engine.Util.format("No such layer '{0}'", layer));
			}

			_layers[layer].push(item);
			item.layer = layer;

			return true;
		}


		//
		// removes item from layer
		//
		// @chainable
		// @param Object item - item for removal
		// @return bool
		//
		this.removeItem = function(item)
		{
			if (!item) {
				return this;
			}

			var layer = _defaultLayer;
			// remove only if it's safe
			if (self.currScene !== item.scene || !_rendering) {
				if (item.layer) {
					layer = item.layer;
				}

				if (!(layer in _layers)) {
					console.log(_layers);
					throw new Error(Engine.Util.format("No such layer '{0}'", layer));
				}

				var pos = _layers[layer].indexOf(item);
				if (pos != -1) {
					var start = _layers[layer].slice(0, pos);
					var end = _layers[layer].slice(pos + 1);
					_layers[layer] = start.concat(end);

					return this;
				}
			}
			else {
				_garbage.push(item);
			}

			return this;
		}


		//
		// return raw items
		//
		// @param array layerName - if given, return layer's items, if not - all
		// @return Engine.Entity[]
		//
		this.getItems = function(layerNames)
		{
			var items = [];
			for (var layer in _layers) {
				if (!layerNames || layerNames.indexOf(layer) != -1) {
					items = items.concat(_layers[layer]);
				}
			}

			return items;
		}


		//
		// removes given layers items
		//
		// @chainable
		// @param string layer - layer name
		//
		this.clearLayer = function(layer)
		{
			if (!(layer in _layers)) {
				throw new Error(Engine.Util.format("No such layer '{0}' for clearing", layer));
			}

			//for (var i = 0, max = _layers[layer].length; i < max; i += 1) {
			//	_layers[layer][i].removeFromCollisions();
			//}

			_layers[layer] = [];

			return this;
		}


		//
		// removes layer
		//
		// @chainable
		// @param string layer - layer name
		//
		this.removeLayer = function(layer)
		{
			this.clearLayer(layer);
			delete _layers[layer];
		}


		//
		// clears this scene (clears all layers)
		//
		// @chainable
		//
		this.clear = function()
		{
			for (var layer in _layers) {
				this.clearLayer(layer);
			}
		}


		//
		// render
		//
		this.render = function()
		{
			for (var i = 0, max = _order.length; i < max; i += 1) {
				var layer = _layers[_order[i]];
				for (var j = 0, len = layer.length; j < len; j += 1) {
					layer[j].render();
				}
			}
		}


		//
		// update
		//
		this.update = function()
		{
			for (var i = 0, max = _order.length; i < max; i += 1) {
				var layer = _layers[_order[i]];
				for (var j = 0, len = layer.length; j < len; j += 1) {
					layer[j].update();
				}
			}
		}


		// create defined layers is given any
		if (config && Engine.Util.isArray(config.layers)) {
			for (var i = 0, max = config.layers.length; i < max; i += 1) {
				this.createLayer(config.layers[i]);
			}
		}

		if (config && config.defaultLayer) {
			this.setDefaultLayer(config.defaultLayer);
		}

		return this;
	}


	//
	// adds separate scene
	//
	// @chainable
	// @param string name - scene name
	// @param Object sceneConfig - Scene config, @see Scene
	//
	this.createScene = function(name, sceneConfig)
	{
		/// this.rp[name] = [];
		this.rp[name] = new Scene(sceneConfig);
		if (!sceneConfig || !sceneConfig.layers) {
			// if no layers were presented, create default one
			this.rp[name].createLayer('main');
		}

		if (this.currScene != "") {
			this.currScene = name;
		}

		this.getEventManager().fire('createscene', this, this, name);

		return this;
	}


	//
	// return Scene object
	//
	// @param string name - scene name
	//
	this.scene = function(name)
	{
		if (!(name in this.rp)) {
			throw new Error(Engine.Util.format("No such scene '{0}'", name));
		}

		return this.rp[name];
	}


	//
	// adds renderable item (object must have .render() and .update() methods)
	//
	// @chainable
	// @param Object item - object to display
	// @param string sceneName - scene name, if not given - current scene
	// @param string layerName - layer name, if not given - default layer is used
	//
	this.addItem = function(item, sceneName, layerName)
	{
		if (!sceneName) {
			sceneName = this.currScene;
		}

		if (!(sceneName in this.rp)) {
			throw new Error(Engine.Util.format("No such scene '{0}'", sceneName));
		}

		if (!Engine.Util.isArray(item)) {
			item = [item];
		}

		for (var i = 0, max = item.length; i < max; i += 1) {
			this.rp[sceneName].addItem(item[i], layerName);
			item[i].scene = sceneName;
		}
		//item.scene = sceneName;
		return true;


	}


	//
	// removes item from render pipe
	//
	// @chainable
	// @param Object item - item for removal
	// @return bool
	//
	this.removeItem = function(item, sceneName)
	{
		if (!sceneName) {
			if (item.scene) {
				sceneName = item.scene;
			}
			else {
				sceneName = this.currScene;
			}
		}
		this.rp[sceneName].removeItem(item);

		return this;
	}


	//
	// get items by given filter
	//
	// @param object filterSpecs - filter specs, if falsy - returns all items
	//					@config string[] scenes - filter by scene names
	//					@config string[] layers - filter by layer names
	//					@config Function[] instances - filter by instances
	//
	this.getItems = function(filterSpecs)
	{
		var tempItems = [],
			items = [],
			fs = filterSpecs || {};

		for (var scene in self.rp) {
			if (!fs.scenes || fs.scenes.indexOf(scene) != -1) {
				tempItems = tempItems.concat(this.scene(scene).getItems(fs.layers ? fs.layers : false));
			}
		}

		if (fs.instances) {
			for (var i = 0, max = tempItems.length; i < max; i += 1) {
				if (fs.instances.indexOf(tempItems[i].constructor) != -1) {
					items.push(tempItems[i]);
				}
			}
		}
		else {
			items = items.concat(tempItems);
		}

		return items;
	}


	//
	// updates all current scene's items
	//
	// @chainable
	//
	this.update = function()
	{
		var scene = this.currScene;
		this.rp[scene].update();

		return this;
	}


	//
	// renders all current scene's items
	//
	// @chainable
	//
	this.render = function()
	{
		_rendering = true;
		var sceneName = this.currScene;
		this.rp[sceneName].render();

		_rendering = false;

		// remove entities if requested any
		if (_garbage.length > 0) {
			for (var k = 0, max = _garbage.length; k < max; k++) {
				this.removeItem(_garbage[k]);
			}

			_garbage = [];
		}

		return this;
	}


	//
	// remove all entities from given scene
	//
	// @chainable
	// @param string sceneName - scene name
	//
	this.clearScene = function(sceneName)
	{
		if (!sceneName) {
			sceneName = this.currScene;
		}
		if (!(sceneName in this.rp)) {
			throw new Error(Engine.Util.format("No such scene '{0}'", sceneName));
		}

		this.rp[sceneName].clear();
		return this;
	}

	return this;
}
