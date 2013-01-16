//
// @mixin Engine.ObjectHelperMixin
//
// mix some useful Object related methods in given object
//
Engine.ObjectHelperMixin = function(obj)
{
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

	return obj;
}