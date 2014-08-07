(function(){

	function* GeneratorFn(){ yield 1 }

	var
		global = (function(){ return this })(),
		Fyber = require('../fyber'),
		YieldValue = require('../yieldValue'),
		_Ap_ = Array.prototype;

	/**
	 * Creates GeneratorFunction from AsyncFunction
	 * @param {Number} [cbPosition] callback argument position. Default = last
	 * @return {GeneratorFunction}
	 */
	Function.prototype.genFn = function(cbPosition){
		if (this instanceof GeneratorFn.constructor) return this;

		!arguments.length && (cbPosition=-1);

		var fn = this;

		return function*(cb){
			var value = new YieldValue(),
				args = _Ap_.slice.call(arguments,0)
			;

			if (cbPosition!=-1 && args.length > cbPosition)
				args.splice(cbPosition,0,null);

			args[cbPosition<0 ? args.length : cbPosition] = function(error, result) {
				value.__error = error;
				value.__result = result;
				value.__done();
			};

			fn.apply(this,args);

			return yield value;
		};
	};

	/**
	 * Runs async function in fyber as fn(arg1,...)
	 * adding fyber's callback at the end of arguments
	 */
	Function.prototype.syncRun = function(){
		if (!Fyber.current) throw new Error('.syncRun called not in fyber');

		var args = _Ap_.slice.call(arguments,0);

		args[args.length] = GeneratorFn.cb;

		this.apply(global, args);
	};

	/**
	 * Calls async function in fyber as fn.call(thisObj, arg1,...)
	 * adding fyber's callback at the end of arguments
	 * @param {*} thisObj
	 */
	Function.prototype.syncCall = function(thisObj) {
		if (!Fyber.current) throw new Error('.syncCall called not in fyber');

		var args = _Ap_.slice.call(arguments,1);

		args[args.length] = GeneratorFn.cb;

		this.apply(thisObj,args);
	};

	/**
	 * Applies async function in fyber as fn.apply(thisObj, [arg1,...])
	 * adding fyber's callback at the end of arguments
	 * @param {*} thisObj
	 */
	Function.prototype.syncApply = function(thisObj) {
		if (!Fyber.current) throw new Error('.syncApply called not in fyber');

		var args = _Ap_.slice.call(arguments,1);

		args[args.length] = GeneratorFn.cb;

		this.apply(thisObj,args);
	};

})();


