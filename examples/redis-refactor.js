// Refactor redis from https://github.com/mranney/node_redis using fybers

/************ CALLBACK STYLE ************/

var redis = require("redis"),
	client = redis.createClient();

client.on("error", function (err) {
	console.log("Error " + err);
});

client.set("string key", "string val", redis.print);
client.hset("hash key", "hashtest 1", "some value", redis.print);
client.hset(["hash key", "hashtest 2", "some other value"], redis.print);
client.hkeys("hash key", function (err, replies) {
	console.log(replies.length + " replies:");
	replies.forEach(function (reply, i) {
		console.log("    " + i + ": " + reply);
	});
	client.quit();
});


/**************** FYBER STYLE *********************/


var Fyber = require('fybers'),
	Redis = require('redis')
;

function* redisWork(){



	var client = Redis.createClient();

	client.on("error", function (err) {
		console.log("Error " + err);
	});

	client.set("string key", "string val", Redis.print);
	client.hset("hash key", "hashtest 1", "some value", Redis.print);
	client.hset(["hash key", "hashtest 2", "some other value"], Redis.print);

	var replies = yield client.hkeys("hash key", redisWork.cb); // instead callback - use yield

	console.log(replies.length + " replies:");

	replies.forEach(function (reply, i) {
		console.log("    " + i + ": " + reply);
	});

	client.quit();
}


new Fyber(redisWork).start();

