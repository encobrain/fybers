var Fyber = require('fybers');

console.log('**************** Channel usage fybers ***************');


var channel = new Fyber.Channel();

function* work1(){
	var data;

	console.log('Started work1');

	while (true) {
		data = yield channel.get();

		console.log('Work1 received data:', data);

		if (!data) break;
	}

	console.log('Ended work1');
}


function* work2(){
	var data, i = 3;

	console.log('Started work2');

	while (i--) {
		data = yield channel.get();

		console.log('Work2 received data:', data);
	}

	console.log('Ended work2');
}


function* channelWork(){

	var i = 5;

	while (i--) {
		console.log('Sends to channel:', i);
		channel.send(i);
	}

}

new Fyber(work1).start();
new Fyber(work2).start();

new Fyber(channelWork).start();
