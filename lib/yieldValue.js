(function(){

	module.exports = YieldValue;

	var
	    global = (function(){ return this})(),
	    _Ap_ = Array.prototype
	    ;

	function YieldValue(){ return this; }

	YieldValue.prototype = {

		__cb: null,

		__done: function(){
			return this.__cb && (('__error' in this) || ('__result' in this)) ?
				this.__cb(this.__error, this.__result) : this;
		}
	};

	/**
	 * Runs async function
	 * @returns {YieldValue}
	 */
	Function.prototype.yieldRun = function() {
	    var value = new YieldValue(),
	        fn = this;

	    arguments[arguments.length] = function(err, result){
	        if (err) value.__error = err;
	        else {
	            if (arguments.length > 2) console.warn('Async function returns more then 1 result: ', fn)

	            value.__result = result;
	        }

	        value.__done();
	    };

	    fn.apply(global,arguments);

	    return value;
	};

	/**
	 * Calls async function
	 * @param {*} obj Object this in function. Next args - args for function WITHOUT callback
	 * @returns {YieldValue}
	 */
	Function.prototype.yieldCall = function(obj){
	    var
	        value = new YieldValue(),
	        args = _Ap_.slice.call(arguments,1),
	        fn = this
	        ;

	    args[args.length] = function(err, result){
	        if (err) value.__error = err;
	        else {
	            if (arguments.length > 2) console.warn('Async function returns more then 1 result: ', fn)

	            value.__result = result;
	        }

	        value.__done();
	    };

	    this.apply(obj,args);

	    return value;
	};

	/**
	 * Applys async function
	 * @param {*} obj Object this in function
	 * @param {Array} args Arguments for function WITHOUT callback
	 * @returns {YieldValue}
	 */
	Function.prototype.yieldApply = function(obj,args){
	    var
	        value = new YieldValue(),
	        fn = this
	        ;

	    args[args.length] = function(err,result){
	        if (err) value.__error = err;
	        else {
	            if (arguments.length > 2) console.warn('Async function returns more then 1 result: ', fn)

	            value.__result = result;
	        }

	        value.__done();
	    };

	    fn.apply(obj,args);

	    return value;
	};

})();