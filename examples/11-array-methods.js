var Fyber = require('fybers');

console.log('**************** Array methods usage fybers ***************');

function* asyncFunction(value, cb){

	console.log('Async run:', value);

	setTimeout(function(){
		console.log('Async end');

		cb(null, value * 10);
	},500);
}


function* arrayMethodsWork(){

	// sync forEach for each item
	yield [1,2,3,4,5].forEach(function* (value, index){
		var result = yield asyncFunction(value, arrayMethodsWork.cb);

		console.log('Result of asyncFunction for',value,':', result);
	});

	console.log('arrayMethodsWork end');
}

new Fyber(arrayMethodsWork).start();
