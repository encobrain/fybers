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
	}

	util.inherits(FyberLock, events.EventEmitter);

	FyberLock.prototype._locked = false;
	FyberLock.prototype._locks = null;

	/**
	 * Locks the fyber by locker or wait for unlock and locks again
	 * @return {YieldValue}
	 */
	FyberLock.prototype.lock = function(){
	    if (!Fyber.current) throw new Error('.lock used not in fyber');

	    var value = new YieldValue();

	    if (!this._locked) {
	        this._locked = true;
	        value.__result = true;
	    } else this._locks.push(value);

	    return value;
	};

	/**
	 * Unlocks first waiting fyber
	 */
	FyberLock.prototype.unlock = function(){
	    if (this._locks.length) {
	        var value = this._locks.shift();
	        value.__result = true;
	        value.__done();
	    } else {
	        this._locked = false
	        this.emit('unlocked');
	    }
	};

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



})();
