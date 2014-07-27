(function () {

	function* GeneratorFn() { yield 1 }

	var Fyber = require('../fyber'),
		_Ap_ = Array.prototype
	;

	/**
	 * Creates generator's async function from GeneratorFunction
	 * @param {Boolean} [adoptScope] Adopt scope: actual|created fyber scope
	 * @return {GeneratorsAsyncFunction}
	 */
	GeneratorFn.constructor.prototype.asyncFn = function(adoptScope){
		var genFn = this,
			parentFyber = adoptScope && Fyber.current
		;

		/**
		 * @return {Fyber}
		 */
		return function GeneratorsAsyncFunction(){
			var cb = arguments[arguments.length-1],
				args = typeof cb === 'function' ?
					_Ap_.slice.call(arguments,0,arguments.length - 1) :
					(cb = function(err){ if (err) throw err }) && arguments,
				fyber = new Fyber(genFn, this),
				parFyber = Fyber.current || parentFyber
			;

			if (parFyber) fyber.scope = parFyber.scope;

			fyber.once('done', cb);

			fyber.start.apply(fyber,args);

			return fyber;
		}
	}

})();
