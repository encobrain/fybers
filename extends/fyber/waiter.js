(function(){

	module.exports =  FyberWaiter;

	function* GeneratorFn(){ yield 1 }

	var Fyber = require('../../fyber'),
	    _Ap_ = Array.prototype,
	    YieldValue = require('../../yieldValue'),
	    waitID = 0
	;

	function FyberWaiter(defaultTime){
	    this._defaultTime = defaultTime;
	    this._waitings = {}
	}

	FyberWaiter.prototype._defaultTime = null;
	FyberWaiter.prototype._waitings = null;

	/**
	 * Waits to notify
	 * @param {Number} [maxTime] Max time to wait
	 * @return {YieldValue}
	 */
	FyberWaiter.prototype._wait = function(maxTime){
	    if (!Fyber.current) throw new Error('Wait outside the fyber');

	    var self = this,
	        value = new YieldValue(),
	        waitFor = maxTime ? maxTime : this._defaultTime || 0
	    ;

	    value.id = Date.now()+'.'+waitID++;
	    self._waitings[value.id] = value;

	    if (waitFor) value.timeoutId = setTimeout(function(){
	        value.__error = new Error('Wait timeout for '+waitFor+'ms');
	        delete self._waitings[value.id];
	        value.__done();
	    }, waitFor);

	    return value;
	};

	function shift(waitings, generatorFn){
	    for (var key in waitings) if (waitings.hasOwnProperty(key)) {
	        var value = waitings[key];
	        if (generatorFn && value.generatorFn !== generatorFn) continue;
	        delete waitings[key];
	        return value;
	    }
	}

	/**
	 * Notifys first waiting fyber
	 * @param {GeneratorFunction} [generatorFn] Notify only waitings of generator function
	 */
	FyberWaiter.prototype.notify = function(generatorFn){
	    var value = shift(this._waitings, generatorFn);

	    if (!value) return;

	    value.__result = true;
	    clearTimeout(value.timeoutId);
	    value.__done();
	}

	/**
	 * Notifys all waiting fybers
	 * @param {GeneratorFunction} [generatorFn] Notify only all waitings of generator function
	 */
	FyberWaiter.prototype.notifyAll = function(generatorFn){
	    var waitings = this._waitings;

	    if (!generatorFn) this.waitings = {};

	    Object.keys(waitings).forEach(function(id){
	        var value = waitings[id];

	        if (generatorFn) {
	            if (value.generatorFn !== generatorFn) return;
	            delete waitings[id];
	        }

	        value.__result = true;
	        clearTimeout(value.timeoutId);
	        value.__done();
	    });
	}

	/**
	 * Waits for all defined waiters in arguments
	 * @param {Number} [globalMaxTime] Max time for all waiters
	 * @return {YieldValue}
	 */
	GeneratorFn.constructor.prototype.wait = function(globalMaxTime){
	    var genValue = new YieldValue(),
	        waitDefined = typeof globalMaxTime === 'number',
	        waiters = _Ap_.slice.call(arguments, waitDefined ? 1 : 0),
	        waitersCount = waiters.length,
	        generatorFn = this
	    ;

	    function done(){
	        if (--waitersCount) return;
	        genValue.__result = true;
	        genValue.__done();
	    }

	    waiters.forEach(function(waiter){
	        var waiterValue = waiter._wait(waitDefined ? globalMaxTime : null);
	        waiterValue.generatorFn = generatorFn;
	        waiterValue.__cb = done;
	    });

	    return genValue;

	}


})();
