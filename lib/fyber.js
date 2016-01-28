(function() {

	module.exports = Fyber;

	function* GeneratorFn(){ yield true }

	function extend(obj, ext) {
		var keys = Object.keys(ext),
			i = keys.length
		;

		while (i--) obj[keys[i]] = ext[keys[i]];
	}

	function tryGen(generator,error, ret) {
		try { return [null, error ? generator.throw(error) : generator.next(ret)]; }
		catch (err) { return [err]; }

	}

	var events = require('events'),
		util = require('util'),
		generatorInstance = GeneratorFn(),
		YieldValue = require('./yieldValue')
	;

	/**
	 * Creates fyber object
	 * @param {AsyncFunction|GeneratorFunction|Generator} worker Any worker for create generator
	 * @param {*} [thisObj] Object for this in execution of fyber function
	 * @return {Fyber}
	 */
	function Fyber(worker, thisObj){
		events.EventEmitter.call(this);

		this._worker = worker;
		this._thisObj = thisObj;
	}

	util.inherits(Fyber, events.EventEmitter);

	extend(Fyber.prototype, {

		_worker: null,
		_thisObj: null,
		_generator: null,
		_startTime: null,
		_cpuTime: 0,
		_cbYieldValue: null,

		_next: function next(error, ret) {
			if (this.state !== 'started') return;

			var prevFyber = Fyber.current,
				fyber = this,
				runTime = Date.now()
			;

			Fyber.current = fyber;

			ret = tryGen(fyber._generator, error, ret);

			fyber._cpuTime += Date.now() - runTime;

			Fyber.current = prevFyber;

			if (ret[0] || ret[1].done) {
				fyber.state = 'done';
				fyber.error = ret[0];
				if (!fyber.error) fyber.result = ret[1].value;

				if (!fyber.listeners('done').length && fyber.error) throw fyber.error;

				fyber.emit('done', fyber.error, fyber.result);


				return;
			}

			if (!fyber._yieldContinue(ret[1].value))
				fyber.throw(new Error('Incorrect yield using in fyber. Yield may be one of:' + Object.keys(Fyber.yieldContinues)));
		},

		_yieldContinue: function(value){
			var continues = Fyber.yieldContinues,
				self = this
			;

			return Object.keys(continues).some(function(key){
				return continues[key].call(self,value);
			});
		},

		// current fyber state: initialized | started | done | interrupted
		state: 'initialized',

		// fyber's scope
		scope: null,

		//fyber's execution error
		error: null,

		//fyber's execution result
		result: null,

		//parent fyber
		parent: null,

		/**
		 * Starts fyber execution.
		 * Any arguments - initialization arguments for function worker
		 * @return {self}
		 */
		start: function () {
			if (this.state !== 'initialized')
				throw new Error('Fyber is already in use');

			this._generator =
				this._worker.constructor === generatorInstance.constructor ? this._worker :
				this._worker instanceof GeneratorFn.constructor ? this._worker.apply(this._thisObj, arguments) :
				this._worker.genFn().apply(this._thisObj, arguments)
			;

			this.emit('start', arguments);

			this._startTime = Date.now();

			this.state = 'started';

			this._next();

			this.emit('started');

			return this;
		},

		/**
		 * Interrupts the fyber
		 * @param {String} [reason] Reason of interrupt
		 */
		interrupt: function (reason){
			this.emit('interrupt', reason);
			this.emit(this.state = 'interrupted', reason);
		},

		/**
		 * Throws the error into fyber
		 * @param {*} error Any error
		 */
		'throw': function(error){ this._generator.throw(error); },

		/**
		 * Checks fyber.state === 'started'
		 * @return {Boolean}
		 */
		isStarted: function(){ return this.state === 'started'; },

		/**
		 * Checks fyber.state === 'interrupted'
		 * @return {Boolean}
		 */
		isInterrupted: function(){ return this.state === 'interrupted'; },

		/**
		 * Checks fyber.state === 'done'
		 * @return {Boolean}
		 */
		isDone: function(){ return this.state === 'done'; },

		/**
		 * Start time
		 * @returns {null|Number}
		 */
		startTime: function () { return this._startTime; },

		/**
		 * Cpu usage time in ms
		 * @param {Number} [setTime] Set cpu time to value;
		 * @returns {Number}
		 */
		cpuTime: function(setTime){ return arguments.length ? this._cpuTime = setTime : this._cpuTime; },

		/**
		 * Adding cpu work time
		 * @param {Number} time
		 */
		addCpuTime: function(time) { this._cpuTime += time; },

		/**
		 * Global work time with idles in ms
		 * @returns {Number}
		 */
		workTime: function(){ return Date.now() - (this._startTime || Date.now()); }
	});

	/**
	 * Current executing fyber
	 * @type {null|Fyber}
	 */
	Fyber.current = null;

	/**
	 * Extends of yield values that fyber can continue
	 * @type {Object}
	 */
	Fyber.yieldContinues = {

		fyber: function(fyber){
			if (!(fyber instanceof Fyber)) return;

			if (fyber.state !== 'done') fyber.once('done', this._next.bind(this));
			else setImmediate(this._next.bind(this), fyber.error, fyber.result);

			return true;
		},

		generator: function(generator){
			if (!generator || generator.constructor !== generatorInstance.constructor) return;

			var fyber = new Fyber(generator),
				parentFyber = fyber.parent = this
				;

			fyber.scope = parentFyber.scope;

			fyber.once('done', function(error,result) {
				parentFyber.addCpuTime(fyber.cpuTime());
				parentFyber._next(error,result);
			});

			setImmediate(function(){ fyber.start() });

			return true;
		},

		yieldValue: function(value) {
			if (!(value instanceof YieldValue)) return;

			var fyber = this;

			value.__cb = function(error, result){
				setImmediate(fyber._next.bind(fyber), error, result);
			};

			if (('__result' in value) || ('__error' in value))
				value.__cb(value.__error, value.__result);

			return true;
		},

		'.cb use': function (cb) {
			cb = this._cbYieldValue;
			this._cbYieldValue = null;
			return Fyber.yieldContinues.yieldValue.call(this, cb);
		},

		'function': function(fn) {
			if (typeof fn !== 'function') return;

			var fyber = this;

			function exec(){
				try { fn(fyber._next.bind(fyber)) }
				catch (err) { fyber._next(err) }
			}

			setImmediate(exec);

			return true
		}
	}

	/**
	 * Creates callback for async function
	 * @return {Function}
	 */
	Object.defineProperty(GeneratorFn.constructor.prototype, 'cb', {
		'get': function(){

			var fyber = Fyber.current,
				yieldValue;

			if (fyber._cbYieldValue)
				throw new Error('.cb can use only one time per yield');

			yieldValue = fyber._cbYieldValue = new YieldValue();

			return function fyberYieldCb(error, result) {
				yieldValue.__error = error;
				yieldValue.__result = result;
				yieldValue.__done();
			}
		}
	});

	// Scope of current fyber
	Object.defineProperty(GeneratorFn.constructor.prototype, 'scope', {
		get: function(){
			return Fyber.current && Fyber.current.scope;
		}
	});

	// Current fyber
	Object.defineProperty(GeneratorFn.constructor.prototype, 'fyber', {
		get: function(){
			return Fyber.current;
		}
	});

})();
