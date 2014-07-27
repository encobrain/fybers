var Fyber = require('../index');

console.log('**************** Lock usage fybers ***************');

var mongoLock = new Fyber.Lock();

function* work1(){

	console.log('Started work1');

	yield mongoLock.lock();

	console.log('Work1 progress...');

	yield work1.sleep(1000);

	console.log('Ended work1');
	mongoLock.unlock();
}

function* work2(){

	console.log('Started work2');

	yield mongoLock.lock();

	console.log('Work2 progress...');

	yield work1.sleep(2000);

	console.log('Ended work2');
	mongoLock.unlock();

}

function* work3(){

	console.log('Started work3');

	yield work3.lock('label1');

	var sleep1 = Math.random()*5000 | 0;

	console.log('label1 sleep for:', sleep1);

	yield work3.sleep(sleep1);

	console.log('label1 end');

	work3.unlock('label1');

	yield work3.lock('label2');

	var sleep2 = Math.random()*5000 | 0;

	console.log('label2 sleep for:',sleep2);

	work3.unlock('label2');

	console.log('label2 end');

	console.log('Ended work3');

}



function* lockWork(){

	console.log('*** Start work1 & work2 ***');

	new Fyber(work1).start();
	new Fyber(work2).start();

	yield mongoLock.waitUnlock(); // wait for fully unlock

	console.log('*** Start work3 x 5. Serial work ***');

	new Fyber(work3).start();
	new Fyber(work3).start();
	new Fyber(work3).start();
	new Fyber(work3).start();
	new Fyber(work3).start();
}


new Fyber(lockWork).start();