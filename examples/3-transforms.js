var Fyber = require('../index');

console.log('**************** function & generatorFunction transforms usage fybers ***************');


function asyncFunction(a,cb,b){
	cb(null,a+b);
}

function* generatorFunction(a,b){
	return a * b;
}

function* someWork(a,b) {

	// transform async function to generator function
	var genFn = asyncFunction.genFn(1);

	var result1 = yield genFn(a, b);

	console.log('Transform async function to generator result (30):', result1); // 30

	// transform generator function to async function
	var asyncFn = generatorFunction.asyncFn();

	var result2 = yield asyncFn(a, b, someWork.cb);

	console.log('Transform generator function to async function result (200):', result2); // 200
}

new Fyber(someWork).start(10,20);
