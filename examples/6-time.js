var Fyber = require('../index');

console.log('**************** Cpu & work time usage fybers ***************');

function calc(){
	var start = Date.now();
	for (var i = 0; i < 100000000; i++) var b = (i^10 + i * 2)/3.5;
	var end = Date.now();
	console.log('Calc time:', end - start);
}

function asyncWork(cb){

	calc()  // time will be calculate

	var sleepStart = Date.now();
	setTimeout(next, 2000);

	function next() {   // after timeout time will be calculate to WORK time
		console.log('Slept time:', Date.now() - sleepStart);

		calc();

		cb();
	}

}

function* generatorWork(cb){

	calc();  // time will be calculate

	var sleptTime = yield generatorWork.sleep(2000);   // after timeout time will be calculate to CPU time
	console.log('Slept time:', sleptTime);

	calc();
}


function* cpuWorkTime(){

	console.log('Start async work...');
	yield asyncWork(cpuWorkTime.cb);

	var asyncCpuTime = cpuWorkTime.fyber.cpuTime();
	var asyncWorkTime = cpuWorkTime.fyber.workTime();

	console.log('Cpu & work times of async function:', asyncCpuTime, asyncWorkTime);

	console.log('Start generator work...');
	yield generatorWork();

	var genCpuTime = cpuWorkTime.fyber.cpuTime();
	var genWorkTime = cpuWorkTime.fyber.workTime();

	console.log('Cpu & work times of generator function:', genCpuTime - asyncCpuTime, genWorkTime - asyncWorkTime);
}



new Fyber(cpuWorkTime).start();


