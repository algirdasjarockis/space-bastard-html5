//
// Small and basic custom event manager which holds event types
// and callbacks for them
//

//
// constructor
//
Engine.EventManager = function()
{
	this._callbacks = {}
}


//
// add event types
//
// @param array/string evtNames - names of event types
//
Engine.EventManager.prototype.add = function(evtNames)
{
	if (Engine.Util.isArray(evtNames)) {
		for (var i = 0, max = evtNames.length; i < max; i += 1) {
			this._callbacks[evtNames[i]] = [];
		}
	}
	else {
		this._callbacks[evtNames] = [];
	}
}


//
// add callback for event
//
// @chainable
// @param string evtName - event name
// @param Function callback - callback function
//
Engine.EventManager.prototype.register = function(evtName, callback)
{
	if (this._callbacks[evtName] === undefined) {
		throw Engine.Util.format("Event '{0}' does not exist.", evtName);
	}

	this._callbacks[evtName].push(callback);
	return this;
}


//
// remove callback from event listeners
//
// @chainable
// @param string evtName - event name
// @param string callback - callback function
//
Engine.EventManager.prototype.unregister = function(evtName, callback)
{
	if (this._callbacks[evtName] === undefined) {
		throw Engine.Util.format("Event '{0}' does not exist.", evtName);
	}

	var cbs = this._callbacks[evtName];
	var pos = cbs.indexOf(callback);
	if (pos != -1) {
		var start = cbs.slice(0, pos);
		var end = cbs.slice(pos + 1);
		this._callbacks[evtName] = start.concat(end);
	}
	else {
		console.log("======= Callback not found:", callback, this._callbacks[evtName]);
	}

	return this;
}


//
// fires given event - executes all associated callbacks
//
// @param string name - registered event name
// @param Object scope - object's context which is used when calling callbacks
//
// @return bool - false means, that at least one callback returned false
//
Engine.EventManager.prototype.fire = function(name, scope)
{
	if (this._callbacks[name] !== undefined) {
		var argStart = 2;
		if (!scope) {
			scope = this;
		}

		var cbs = this._callbacks[name];
		var args = [];
		for (var i = argStart, max = arguments.length; i < max; i += 1) {
			args.push(arguments[i]);
		};

		var ret = true;
		for (var j = 0, m = cbs.length; j < m; j += 1) {
			if (cbs[j] && cbs[j].apply(scope, args) === false) {
				ret = false;
			}
		}

		return ret;
	}
	else {
		//throw new Error(name + ' does not exist');
	}

	return true;
}
