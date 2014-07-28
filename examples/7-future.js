var Fyber = require('fybers');

console.log('**************** Future usage fybers ***************');

function asyncFunction(a, cb){
	console.log('asyncFunction start. wait 1 sec');
	setTimeout(function(){
		console.log('asyncFunction done');
		cb(null, a * 10);
	},1000);
}

function* generatorFunction(a){
	console.log('generatorFunction start');

	return a / 10;
}


function* futureWork(a){

	// creating futures
	var asyncRequest = yield asyncFunction(10, futureWork.fcb), // call async function
		generatorRequest = generatorFunction(10).future // call generator execution
	;

	//wait for one future
	var result = yield asyncRequest.get();

	console.log('Async function result once (100):', result);

	//wait for defined futures
	yield futureWork.waitFutures(asyncRequest, generatorRequest);

	console.log('Async function result (100):', asyncRequest.result);
	console.log('Generator function result (1):', generatorRequest.result);


	// Dynamic futures: wait for all futures
	var dynamicFutures = [];

	for (var i = 0; i < a; i++) {
		dynamicFutures[i*2] = yield asyncFunction(i, futureWork.fcb);
		dynamicFutures[i*2+1] = generatorFunction(i).future;
	}

	yield futureWork.waitFutures();

	console.log('Dynamic results:');

	for (var i=0; i < a; i++) {
		console.log('Async result for ',i,': ', dynamicFutures[i*2].result);
		console.log('Generator result for ',i,': ', dynamicFutures[i*2+1].result);
	}
}


new Fyber(futureWork(5)).start();

