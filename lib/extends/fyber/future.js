(function(){

	module.exports = FyberFuture;

	function* GeneratorFn(){ yield 1 }

	var events = require('events'),
		util = require('util'),
		Fyber = require('../../fyber'),
		YieldValue = require('../../yieldValue'),
		generatorInstance = GeneratorFn(),
		futureID = 0
	;

	function FyberFuture(generator) {
		events.EventEmitter.call(this);

		if (generator && !(generator instanceof generatorInstance.constructor))
			throw new Error('<generator> is not instanceof Generator')

		this.id = Date.now()+'.'+futureID++;

		var future = this,
			parentFyber = Fyber.current
		;

		function futureCb(error, result) {
			if (future.done !== false) return;

			if (parentFyber._futures) delete parentFyber._futures[future.id];

			future.error = error;
			future.result = result;
			future.done = true;

			future.emit('done', error, result);
		}

		this.cb = futureCb;

		if (!generator) return;

		var fyber = new Fyber(generator);

		fyber.scope = parentFyber.scope;

		fyber.once('done', function(error, result){
			parentFyber.addCpuTime(fyber.cpuTime());
			futureCb(error,result);
		});

		fyber.start();
	}

	util.inherits(FyberFuture, events.EventEmitter);

	// Callback function to async function for receive result
	FyberFuture.prototype.cb = null;
	// Error of future's request
	FyberFuture.prototype.error = null;
	// Result of future's request
	FyberFuture.prototype.result = null;
	// Done or not future request
	FyberFuture.prototype.done = false;
	FyberFuture.prototype.id = null;

	/**
	 * Gets result from future. If no result - wait for it
	 */
	FyberFuture.prototype.get = function(){
		var value = new YieldValue();

		if (this.done === true) {
			value.__error = this.error;
			value.__result = this.result;
		} else this.once('done', function(error, result) {
			value.__error = error;
			value.__result = result;
			value.__done();
		});

		return value;
	};

	Fyber.prototype._futures = null;
	Fyber.prototype._fcbYieldValue = null;

	/**
	 * Creates future object and adds to futures in fyber
	 * @type {FyberFuture}
	 */
	Object.defineProperty(generatorInstance.constructor.prototype, 'future', {
		get: function () {

			var fyber = Fyber.current;

			if (!fyber) throw new Error('.future calls not in fyber');

			var future = new FyberFuture(this),
				futures = fyber._futures || (fyber._futures = {})
				;

			futures[future.id] = future;

			return future;
		}
	});

	/**
	 * Gets the future callback for async function and adds to futures in fyber
	 * @return {Function}
	 */
	Object.defineProperty(GeneratorFn.constructor.prototype, 'fcb', {
		get: function(){
			var fyber = Fyber.current,
				future = new FyberFuture(),
				futures = fyber._futures || (fyber._futures = {}),
				yieldValue;

			if (fyber._fcbYieldValue)
				throw new Error('.fcb can use only one time per yield');

			yieldValue = fyber._fcbYieldValue = new YieldValue();
			yieldValue.__result = future;

			futures[future.id] = future;

			return future.cb;
		}
	});

	Fyber.yieldContinues['.fcb use'] = function(value){
		value = this._fcbYieldValue;
		this._fcbYieldValue = null;
		return Fyber.yieldContinues.yieldValue.call(this, value);
	};

	function isObjectArray(object) {
		return typeof object === 'object' && object !==null && (Array.isArray(object) || object.constructor === Object)
	}

	function yieldObject(object, cb) {
		var keys = Object.keys(object),
			ret = new object.constructor(),
			wait = keys.length
		;

		keys.forEach(function(key) {
			var value = object[key];

			function done(error, result) {
				ret[key] = {error: error, result: result};
				--wait || cb(null, ret);
			}

			if (value instanceof generatorInstance.constructor || typeof value === 'function') {
				var fyber = value instanceof Fyber ? value : new Fyber(value);

				if (fyber.isDone()) return done(fyber.error,fyber.result);

				fyber.once('done', done);

				return fyber.start();
			}

			if (value instanceof FyberFuture) {
				if (value.done) return done(value.error,value.result);

				return value.once('done', done);
			}

			if (isObjectArray(value)) return yieldObject(value, done);

			ret[key] = value;

			--wait || cb(null, ret);

		});
	}

	Fyber.yieldContinues.object = Fyber.yieldContinues.array = function(object) {


		if (isObjectArray(object)) {
			console.log(1111);
		   setImmediate(yieldObject, object, this._next.bind(this));

		   return true;
	   }
	};

	/**
	 * Waits for all or defined futures
	 */
	GeneratorFn.constructor.prototype.waitFutures = function(){
		var cb = this.cb,
			waitCount = 0,
			fyber = Fyber.current,
			futures = arguments.length ? arguments : fyber._futures || {}
		;

		futures = Object.keys(futures).map(function(id){ return futures[id]; });

		function done(){
			if (!--waitCount) cb();
		}

		futures.forEach(function(future){
			if (future.done === true) return;

			waitCount++;

			future.once('done', done);
		});

		if (!waitCount) cb();
	}


})();
