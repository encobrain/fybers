(function(){

	function* GeneratorFn(){ yield 1 }

	/**
	 * Sleeps the fyber for time
	 * @param {Number} time Time for sleep
	 */
	GeneratorFn.constructor.prototype.sleep = function(time) {
	    var cb = this.cb, timeStart = Date.now() ;

	    setTimeout(function(){ cb(null, Date.now() - timeStart); }, time);
	};

})();