//
// @mixin Engine.EventManagerMixin
//
// mix event managing in given object
//
Engine.EventManagerMixin = function(obj) {
	var _evtMgr = new Engine.EventManager();

	//
	// adds handler to given event
	//
	// @chainable
	// @param string evtName - event name
	// @param Function callback - handler function
	//
	obj.on = function(evtName, callback)
	{
		_evtMgr.register(evtName, callback);
		return obj;
	}


	//
	// removes handler to given event
	//
	// @chainable
	// @param string evtName - event name
	// @param Function callback - handler function
	//
	obj.off = function(evtName, callback)
	{
		_evtMgr.unregister(evtName, callback);
		return obj;
	}


	//
	// register events
	//
	// @chainable
	// @param Array events - array of string event names
	//
	obj.registerEvents = function(events)
	{
		_evtMgr.add(events);
		return obj;
	}


	//
	// return reference to Engine.EventManager
	//
	// @return Engine.EventManager
	//
	obj.getEventManager = function()
	{
		return _evtMgr;
	}
}