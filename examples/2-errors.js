
var Fyber = require('../index');

console.log('**************** Errors usage fybers ***************');

function errorAsyncFunction(cb){
	setTimeout(function(){
	    cb(new Error('Async function error'));
	});
}

function* errorGenerator(){
	throw new Error('Generator function error');
}


function* errorWork(a,b){

	//catching async function error

	try {
	    var result1 = yield errorAsyncFunction(errorWork.cb);
	} catch (err){
	    console.log('async function result error:', err);
	}

	//catching generator function error

	try {
	    var result2 = yield errorGenerator();
	} catch (err) {
	    console.log('Generator result error:', err);
	}

	throw new Error('errorWork error');
}

var work = new Fyber(errorWork, {thisObj: true});

work.on('done', function (error, result) {
	console.log('errorWork error & result:', error, result); // -234.5
});

console.log('Start errorWork...');
work.start();

