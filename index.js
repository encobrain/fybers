(function(){

	require('./lib/extends/function');
	require('./lib/extends/generatorFn');
	require('./lib/extends/array');
	require('./lib/extends/fyber/sleep');

	var Fyber = require('./lib/fyber'),
		Channel = require('./lib/extends/fyber/channel'),
		Lock = require('./lib/extends/fyber/lock'),
		Future = require('./lib/extends/fyber/future'),
		Waiter = require('./lib/extends/fyber/waiter'),
		YieldValue = require('./lib/yieldValue')
	;

	Fyber.Channel = Channel;
	Fyber.Lock = Lock;
	Fyber.Future = Future;
	Fyber.Waiter = Waiter;
	Fyber.YieldValue = YieldValue;

	module.exports = Fyber;

})();
