(function(){

	module.exports = FyberLock;

	function* GeneratorFn(){}

	var Fyber = require('../../fyber'),
		events = require('events'),
		util = require('util'),
		YieldValue = require('../../yieldValue')
	;

	function FyberLock(){
		events.EventEmitter.call(this);
		this._locks = [];
		this._unlockNextFn = this.unlock.bind(this);
	}

	util.inherits(FyberLock, events.EventEmitter);

	FyberLock.prototype._locked = false;
	FyberLock.prototype._unlockNextFn = null;
	FyberLock.prototype._locks = null;

	/**
	 * Locks the fyber by locker or wait for unlock and locks again
	 * @return {YieldValue}
	 */
	FyberLock.prototype.lock = function(){
		if (!Fyber.current) throw new Error('.lock used not in fyber');

		var value = new YieldValue();

		if (!this._locked) {
			this._locked = Fyber.current;
			value.__result = true;
		} else this._locks.push(value);

        Fyber.current.once('done', this._unlockNextFn);

		return value;
	};

	/**
	 * Unlocks first waiting fyber
	 */
	FyberLock.prototype.unlock = function(){
		if (this._locked) {
            this._locked.removeListener('done', this._unlockNextFn);

            var value = this._locks.shift();

			if (value) {
				value.__result = true;
				value.__done();
			} else {
				this._locked = false
				this.emit('unlocked');
			}
		}
	};

	/**
	 * Unlocks all waiting fybers
	 * @param {Error} [throwError] Throw error when unlock
	 */
	FyberLock.prototype.unlockAll = function(throwError){
		if (!this._locked) return;

		this._locked.removeListener('done', this._unlockNextFn);

		this._locks.forEach(function(value){
			value.__error = throwError;
			value.__result = true;
			value.__done();
		});

		this._locks.length = 0;
		this._locked = false;
		this.emit('unlocked');
	}

	/**
	 * Waits for fully unlock
	 * @return {YieldValue}
	 */
	FyberLock.prototype.waitUnlock = function(){
		var value = new YieldValue();

		if (this._locked) this.once('unlocked', function(){
			value.__result = true;
			value.__done();
		});
		else value.__result = true;

		return value;
	}

	/**
	 * Is locked lock or not?
	 * @returns {Boolean}
	 */
	FyberLock.prototype.isLocked = function(){
		return !!this._locked;
	}

	GeneratorFn.constructor.prototype._fyberLocks = null;

	/**
	 * Locks the fyber by label
	 * @param {String} label Laber of lock. Need to fyber.unlock()
	 * @return {YieldValue}
	 */
	GeneratorFn.constructor.prototype.lock = function(label){
		var locks = this._fyberLocks || (this._fyberLocks = {}),
			lock = locks[label] || (locks[label] = new FyberLock());

		return lock.lock();
	};

	/**
	 * Unlocks the fyber by label
	 * @param {String} label Label of lock
	 */
	GeneratorFn.constructor.prototype.unlock = function(label){
		var locks = this._fyberLocks || {},
			lock = locks[label];

		if (!lock) throw new Error('Locking not found by label: ' + label)

		lock.unlock();
	};

	/**
	 * Unlocks all fybers by label
	 * @param {String} label Label of lock
	 * @param {Error} [throwError] Throw error when unlock
	 */
	GeneratorFn.constructor.prototype.unlockAll = function(label, throwError) {
		var locks = this._fyberLocks || {},
			lock = locks[label];

		if (!lock) throw new Error('Locking not found by label: ' + label)

		lock.unlockAll(throwError);
	}

	/**
	 * Is locked fyber by label or not?
	 * @param {String} label Label of lock
	 * @return {Boolean}
	 */
	GeneratorFn.constructor.prototype.isLocked = function(label) {
		var locks = this._fyberLocks || {},
			lock = locks[label];

		return !!(lock && lock._locked);
	}



})();
