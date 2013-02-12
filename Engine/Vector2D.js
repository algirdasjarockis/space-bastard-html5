//
// 2D vector class
//

Engine.Vector2D = function(x, y)
{
	this.x = x;
	this.y = y;

	//
	// adds vector
	//
	// @param Vector v - vector
	// @return Vector
	//
	this.add = function(v)
	{
		return new Engine.Vector2D(this.x + v.x, this.y + v.y);
	}


	//
	// subtracts vector
	//
	// @param Vector v - vector
	// @return Vector
	//
	this.sub = function(v)
	{
		return new Engine.Vector2D(this.x - v.x, this.y - v.y);
	}


	//
	// compares vector - checks for equality
	//
	// @param Vector v - vector
	// @return bool
	//
	this.eq = function(v)
	{
		return (v.x == this.x && v.y == this.y);
	}


	//
	// multiple vector by given scalar value
	//
	// @param float n - scalar value
	// @return Vector
	//
	this.mult = function(n)
	{
		return new Engine.Vector2D(this.x * n, this.y * n);
	}


	//
	// divide vector by given scalar value
	//
	// @param float n - scalar value
	// @return Vector
	//
	this.div = function(n)
	{
		if (n !== 0) {
			return new Engine.Vector2D(this.x / n, this.y / n);
		}

		return this;
	}


	//
	// get dot product value against given vector
	//
	// @param
	//
	this.dot = function(v)
	{
		return (this.x * v.x + this.y * v.y);
	}


	//
	// make vector perpendicular
	//
	// @chainable
	//
	this.pend = function()
	{
		var t = this.x;
		this.x = -y;
		this.y = t;

		return this;
	}


	//
	// return vector's length
	//
	this.len = function()
	{
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}


	//
	// normalize vector
	//
	// @chainable
	//
	this.norm = function()
	{
		var len = Math.sqrt(this.dot(this));
		if (len !== 0) {
			var rc = 1.0 / len;
			this.x *= rc;
			this.y *= rc;
		}

		return this;
	}
}
