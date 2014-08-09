(function(){

	module.exports =  FyberWaiter;

	function* GeneratorFn(){ yield 1 }

	var Fyber = require('../../fyber'),
		_Ap_ = Array.prototype,
		YieldValue = require('../../yieldValue'),
		waitID = 0
	;

	function FyberWaiter(defaultTime, defaultError){
		if (typeof defaultTime !== 'number') {
			defaultError = defaultTime;
			defaultTime = null;
		}

		this._defaultTime = defaultTime;
		this._defaultError = defaultError;
		this._waitings = {}
	}

	FyberWaiter.prototype._defaultTime = null;
	FyberWaiter.prototype._defaultError = null;
	FyberWaiter.prototype._waitings = null;

	/**
	 * Waits to notify
	 * @param {Number} [maxTime] Max time to wait
	 * @param {Error} [timeoutError] Error for throw when wait ends
	 * @return {YieldValue}
	 */
	FyberWaiter.prototype._wait = function(maxTime, timeoutError){
		if (!Fyber.current) throw new Error('Wait outside the fyber');

		var self = this,
			value = new YieldValue(),
			waitFor = maxTime ? maxTime : this._defaultTime || 0
		;

		value.id = Date.now()+'.'+waitID++;
		self._waitings[value.id] = value;

		if (waitFor) value.timeoutId = setTimeout(function(){
			value.__error = timeoutError || self._defaultError || new Error('Wait timeout for '+waitFor+'ms');
			if (!value.__error.code) value.__error.code = 'WAIT_TIMEOUT';
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
	 * @param {Error} [throwError] Error for throw in waiter
	 */
	FyberWaiter.prototype.notify = function(generatorFn, throwError){
		if (typeof generatorFn !== 'function') {
			throwError = generatorFn;
			generatorFn = null;
		}

		var value = shift(this._waitings, generatorFn);

		if (!value) return;

		value.__error = throwError;
		value.__result = true;
		clearTimeout(value.timeoutId);
		value.__done();
	}

	/**
	 * Notifys all waiting fybers
	 * @param {GeneratorFunction} [generatorFn] Notify only all waitings of generator function
	 * @param {Error} [throwError] Error for throw in waiter
	 */
	FyberWaiter.prototype.notifyAll = function(generatorFn, throwError){
		if (typeof generatorFn !== 'function') {
			throwError = generatorFn;
			generatorFn = null;
		}

		var waitings = this._waitings;

		if (!generatorFn) this.waitings = {};

		Object.keys(waitings).forEach(function(id){
			var value = waitings[id];

			if (generatorFn) {
				if (value.generatorFn !== generatorFn) return;
				delete waitings[id];
			}

			value.__error = throwError;
			value.__result = true;
			clearTimeout(value.timeoutId);
			value.__done();
		});
	}

	/**
	 * Waits for all defined waiters in arguments
	 * @param {Number} [globalMaxTime] Max time for all waiters
	 * @param {Error} [globalTimeoutError] Error for throw in waiters on timeout
	 * @return {YieldValue}
	 */
	GeneratorFn.constructor.prototype.wait = function(globalMaxTime, globalTimeoutError){
		var
			glMaxTime = globalMaxTime,
			glTimeError = globalTimeoutError,
			waiters = 0
		;

		if (typeof glMaxTime === 'number') {
			waiters = glTimeError instanceof FyberWaiter ? (glTimeError=null) || 1 : 2;
		} else {
			if (glMaxTime instanceof FyberWaiter) glTimeError = null;
			else {
				glTimeError = glMaxTime;
				waiters = 1;
			}

			glMaxTime = null;
		}

		waiters =  _Ap_.slice.call(arguments, waiters);

		var genValue = new YieldValue(),
			waitersCount = waiters.length,
			generatorFn = this,
			firstError
		;

		function done(error){
			firstError = firstError || error;
			if (--waitersCount) return;
			genValue.__error = firstError;
			genValue.__done();
		}

		waiters.forEach(function(waiter){
			var waiterValue = waiter._wait(glMaxTime, glTimeError);
			waiterValue.generatorFn = generatorFn;
			waiterValue.__cb = done;
		});

		return genValue;

	}


})();
