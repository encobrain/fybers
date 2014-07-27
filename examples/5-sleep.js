var Fyber = require('../index');

console.log('**************** Sleep usage fybers ***************');

function* someWork() {

	console.log('Time before sleep:', Date.now());

	var sleptTime = yield someWork.sleep(2000);

	console.log('Time after sleep & sleptTime (~2000ms): ', Date.now(), sleptTime);
}

new Fyber(someWork).start();

