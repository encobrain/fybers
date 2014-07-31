(function(){

	function* GeneratorFn(){ yield 1 }

	var YieldValue = require('../yieldValue'),
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

})();


