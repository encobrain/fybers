
var Fyber = require('../index');

function* generatorFunction(a,b){
	console.log('GeneratorFunction this & args:', this, arguments);

	return a * b;
}

var generatorInstance = generatorFunction(1,2);

function asyncFunction(a,b,cb){
	console.log('AsyncFunction this & args:', this, arguments);

	setTimeout(function(){
		cb(null, a + b);
	},1000);
}

// ***************** Creating a fyber ********************

var thisObj = {};

var fyber = new Fyber(generatorFunction, thisObj);
var fyber = new Fyber(generatorInstance);
var fyber = new Fyber(asyncFunction, thisObj);

console.log('**************** Synchronious usage fybers ***************');

var someObject = {

	prop: 25,

	asyncFnMethod: function(a, b, cb){
		cb(null, a - b * this.prop);
	},

	generatorFnMethod: function* (a, b){
		return a / b + this.prop;
	}

};

function* syncWork(a,b){

	//gets current fyber
	syncWork.fyber;

	//gets scope of current fyber
	syncWork.scope === syncWork.fyber.scope;

	console.log('This & args of syncWork:', this, arguments);

	// call async function with some this object
	var result1 = yield asyncFunction.call({someThisObj: true}, a, b, syncWork.cb);

	console.log('Async function result (30):', result1);  // 30

	// call generator function with some this object
	var result2 = yield generatorFunction.call({someThisObj2: true}, a, b);

	console.log('Generator function result (200):', result2);  // 200

	//call async method of someObject
	var result3 = yield someObject.asyncFnMethod(a, b, syncWork.cb);

	console.log('Async method result (-490):', result3); // -490

	//call generator method of someObject
	var result4 = yield someObject.generatorFnMethod(a,b);

	console.log('Generator method result (25.5):', result4); // 25.5

	return result1 + result2 + result3 + result4;
}

var work = new Fyber(syncWork, {thisObj: true});



work.on('done', function (error, result) {
	console.log('syncWork error & result (-234.5):',error, result); // -234.5
});

console.log('Start syncWork...');
work.start(10,20); // start work asynchroniusly
console.log('Started syncWork...');
