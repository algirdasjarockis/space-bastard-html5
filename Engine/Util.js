//
// Global collection of common functions
//
Engine.Util = {
	//
	// load .js file and embed into current html document
	// and make script executed
	//
	// @param string path - URL to desired js file
	// @param function successCallback - callback on sucessful load
	// @param function failureCallback - callback on failed load
	//
	loadJs: function(path, successCallback, failureCallback)
	{
		var script = document.createElement("script")
		script.type = "text/javascript";

		if (!successCallback) {
			successCallback = function() { return 0; };
		}
		if (!failureCallback) {
			failureCallback = function() { return 0; };
		}

		if (script.readyState){  //IE
			// @TODO: add onerror callback here
			script.onreadystatechange = function(){
				if (script.readyState == "loaded" || script.readyState == "complete") {
					script.onreadystatechange = null;
					successCallback();
				}
			};
		} else {  //Others
			script.onload = function() {
				successCallback();
			};
			script.onerror = function() {
				failureCallback();
			}
		}

		script.src = path;
		document.getElementsByTagName("head")[0].appendChild(script);
	},


	//
	// gets random integer value in range [min, max]
	//
	// @param int min - min value
	// @param int max - max value
	// @return int
	//
    random: function(min, max)
	{
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },


	//
	// get random real value in range [min, max]
	//
	// @param int min - min value
	// @param int max - max value
	// @return int
	//
    realRandom: function(min, max)
	{
        return Math.random() * (max - min) + min;
    },


	//
	// formats given string - inserts values in string
	// Example: Engine.Util.format("I got number: {0}", 1337)
	//
	// @param string str - string
	// @return string
	//
	format: function(str)
	{
		for(var i = 1, max = arguments.length; i < max; i++) {
			var re = new RegExp("\\{" + (i - 1) + "\\}", 'ig');
			str = str.replace(re, arguments[i]);
		}

		return str;
	},


	//
	// Checks whether given value is array object
	//
	isArray: function(val)
	{
		return Object.prototype.toString.apply(val) == '[object Array]';
	},


	//
	// merges given objects
	//
	// @param Object targetObj - target object
	// @param Object sourceObj - source object
	// @return Object - merged object
	//
	merge: function(targetObj, sourceObj)
	{
		for (var prop in sourceObj) {
			targetObj[prop] = sourceObj[prop];
		}

		return targetObj;
	}
}
