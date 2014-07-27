var Fyber = require('../index');

console.log('**************** Waiter usage fybers ***************');

var mysqlWaiter = new Fyber.Waiter(1500),
	mongoWaiter = new Fyber.Waiter()
	;


function* work1(){
	console.log('Started work1');

	yield work1.wait(mysqlWaiter);

	console.log('Ended work1');
}


function* work2(){
	console.log('Started work2');

	yield work2.wait(mongoWaiter);

	console.log('Ended work2');
}

function* work3(){
	console.log('Started work3');

	yield work3.wait(3000, mysqlWaiter); // set wait for 3000ms instead default 1500ms

	console.log('Ended work3');

}

function* work4(){
	console.log('Started work4');

	yield work4.wait(3000, mysqlWaiter, mongoWaiter); // wait for max 3000ms for mysql & mongo

	console.log('Ended work4');
}


function* waiterWork(){

	console.log('*** Start work1 without any notify  ***');

	try {
	    yield work1(); // will be error because no notify during 1sec
	} catch (err) {
	    console.log('Catch error:', err);
	}

	console.log('*** Start work1 & work2 ***');

	new Fyber(work1).start();
	new Fyber(work2).start();

	console.log('> Sleep 500ms');

	yield waiterWork.sleep(500);

	console.log('> Notify mysql');

	mysqlWaiter.notify(); // work1 ends but work2 waiting

	console.log('Sleep 2000ms');

	yield waiterWork.sleep(2000);

	console.log('> Notify mongo');

	mongoWaiter.notify();    // work2 ends

	console.log('*** Start work3 ***');

	new Fyber(work3).start();

	console.log('Sleep 2500ms');

	yield waiterWork.sleep(2500);

	console.log('> Notify mysql');

	mysqlWaiter.notify(); // work3 ends and no errors

	console.log('*** Start work4 ***');

	new Fyber(work4).start();

	console.log('> Sleep 1000ms');

	yield waiterWork.sleep(1000);

	console.log('> Notify mysql');

	mysqlWaiter.notify();   // work4 waits

	console.log('> Sleep 1000ms');

	yield waiterWork.sleep(1000);

	console.log('> Notify mongo');

	mongoWaiter.notify(); // work4 ends

	console.log('*** Start work1 && work2 x 2 && work3 && work4 ***');

	new Fyber(work1).start();
	new Fyber(work2).start();
	new Fyber(work2).start();
	new Fyber(work3).start();
	new Fyber(work4).start();

	console.log('> Sleep 500ms');

	yield waiterWork.sleep(500);

	console.log('> Notify only mysql in work4');

	mysqlWaiter.notify(work4);  // all waits

	console.log('> Sleep 500ms');

	yield waiterWork.sleep(500);

	console.log('> Notify all mysql');

	mysqlWaiter.notifyAll(); // work1 && work3 ends

	console.log('> Sleep 500ms');

	yield waiterWork.sleep(500);

	console.log('> Notify all mongo in work2');

	mongoWaiter.notifyAll(work2);   // 2 x work2 ends

	console.log('> Notify mongo');

	mongoWaiter.notify(); // work4 ends
}

new Fyber(waiterWork).start();


