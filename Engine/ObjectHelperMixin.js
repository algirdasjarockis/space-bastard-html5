//
// @mixin Engine.ObjectHelperMixin
//
// mix some useful Object related methods in given object
//
Engine.ObjectHelperMixin = function(obj)
{
	// object which will hold all parents' methods
	var _parentsRealm = {};

	//
	// set given object's properties to caller object
	//
	// @chainable
	// @param Object values - properties collection
	//
	obj.set = function(values)
	{
		if (typeof values == 'object') {
			for (var p in values) {
				obj[p] = values[p];
			}
		}

		return obj;
	}


	//
	// returns multiple properties wrapped in object
	//
	// @param Array values - array of property names
	//
	obj.get = function(values)
	{
		var ret = {};
		if (Engine.Util.isArray(values)) {
			for (var i = 0, max = values.length; i < max; i++) {
				ret[values[i]] = obj[values[i]];
			}
		}
		else if (values === undefined) {
			// @FIXME it's not good idea i think but it should work on simple cases
			// return all props
			for (var prop in obj) {
				if (typeof(obj[prop]) != 'function') {
					ret[prop] = obj[prop];
				}
			}
		}

		return ret;
	}


	//
	// Inherits current object from another object
	//
	// @chainable
	// @param Object baseObj - object from which inheritance will happen
	// @param Object specs - inheritance settings, example:
	//							myObject.inherit(new MyBaseClass(), {public: [], private: {members: [], container: myBaseClass}}
	//
	//							public property holds array of member names which will be inherited
	//							private property is object which holds array of member names being treated as private and stored
	//							in private.container, they won't be public in child
	//
	obj.inherit = function(baseObj, specs)
	{
		for (var member in baseObj) {
			if (specs) {
				if ('private' in specs && Engine.Util.isArray(specs['private'].members) && specs['private'].members.indexOf(member) != -1) {
					if ('container' in specs['private']) {
						// save member to user defined container used for base object privates
						specs['private'].container[member] = baseObj[member];
					}
					continue;
				}
				else if ('public' in specs && Engine.Util.isArray(specs['public']) && specs['public'].indexOf(member) == -1) {
					// base object member was not mentioned in specs
					continue;
				}
			}

			// inherit all
			if (typeof obj[member] === 'undefined') {
				// prevent overwriting child members
				obj[member] = baseObj[member];
			}
		}

		Engine.Util.merge(_parentsRealm, baseObj);

		return obj;
	}


	//
	// Inherits current object from defined class (function) reference
	//
	// @chainable
	// @param Function classRef - reference to class
	// @param Arguments/Array args - arguments forwarded to parent class constructor
	// @param Object specs - same specs as in .inherit()
	//
	obj.inheritClass = function(classRef, args, specs)
	{
		if (typeof classRef == 'function') {
			//var parent = classRef.apply({}, args);

			function Parent() {
				return classRef.apply(this, args);
			}
			Parent.prototype = classRef.prototype;

			var parent = new Parent();
			obj.inherit(parent, specs);
		}

		return obj;
	}


	//
	// Calls parent method
	//
	// @param string funcName - name of method
	//
	obj.callParent = function(funcName)
	{
		var args = Array.prototype.slice.call(arguments, 1);
		return _parentsRealm[funcName].apply(obj, args);
	}


	return obj;
}