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

		return function*(){
			var value = new YieldValue();

			if (cbPosition!=-1 && arguments.length > cbPosition)
				_Ap_.splice.call(arguments,cbPosition,0,null);

			arguments[cbPosition<0 ? arguments.length : cbPosition] = function(error, result) {
				value.__error = error;
				value.__result = result;
				value.__done();
			};

			fn.apply(this,arguments);

			return yield value;
		};
	};

})();


