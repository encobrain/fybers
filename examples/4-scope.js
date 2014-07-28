var Fyber = require('fybers'),
	events = require('events')
;

console.log('**************** Scope usage fybers ***************');

function* someObjectWork(){
	someObjectWork.scope.cde = 2;
}

function* someWork(object) {

	console.log('Scope of fyber:', someWork.scope);

	someWork.scope.abc = 1;

	object.emit('someEvent');

	object.on('end', someObjectWork.asyncFn(true));

	return 'done';
}


function* someWork2(){

	someWork2.scope.def = 3;

}

var someEventObject = new events.EventEmitter();

someEventObject.on('someEvent', someWork2.asyncFn()); // no adoptScope


var work = new Fyber(someWork);
var someScope = {someScope: true};

work.scope = someScope;

work.on('done', function(error,result){
	console.log('someWork result:', result);   // done
	console.log('someWork scope result:', work.scope);  // {someScope: true, abc: 1, def: 3}

	someEventObject.emit('end');

	console.log('someWork scope result out of fyber call with adopttScope:', work.scope) // {someScope: true, abc: 1, def: 3, cde:2}
});

work.start(someEventObject);

