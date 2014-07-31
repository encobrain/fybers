var Fyber = require('../index');

console.log('**************** Future usage array object fybers ***************');

function asyncFunction(cb) {
	console.log('Async function start');
	setTimeout(function() {
		console.log('Async function end');
		cb(null,10)
	}, 1000);
}

function* generatorFunction(a) {

	console.log('Generator function start');
	if (!a) throw new Error('Some error');
	yield generatorFunction.sleep(2000);
	console.log('Generator function end');
	return 20;
}

function* someWork(){

	var retArray = yield [asyncFunction, generatorFunction(1)];

	console.log('Results for yield array:', retArray);

	var retObject = yield {
		abc: asyncFunction,
		cde: generatorFunction
	};

	console.log('Results for yield object:', retObject)
}

new Fyber(someWork).start();

