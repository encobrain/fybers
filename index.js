(function(){

	require('./extends/function');
	require('./extends/generatorFn');
	require('./extends/fyber/sleep');

	var Fyber = require('./fyber'),
	    Channel = require('./extends/fyber/channel'),
	    Lock = require('./extends/fyber/lock'),
	    Future = require('./extends/fyber/future'),
	    Waiter = require('./extends/fyber/waiter'),
	    YieldValue = require('./yieldValue')
	;

	Fyber.Channel = Channel;
	Fyber.Lock = Lock;
	Fyber.Future = Future;
	Fyber.Waiter = Waiter;
	Fyber.YieldValue = YieldValue;

	module.exports = Fyber;

})();
