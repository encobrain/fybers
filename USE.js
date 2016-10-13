var fybers = require('./index'),
    ycb = fybers.ycb;

/**
 * Created by encobrain on 11.10.16.
 */

// Simple use with generator functions

function* sum_ (a, b) {
    if (arguments.length < 2) throw new Error('Need 2 args');

    return a + b;
}

function cb (err, result) {
    console.log('cb used');

    if (err) throw err;

    console.log(result);
}

//sum_(1).run();  // throws error to node

//sum_(2).run(cb); // throws error to cb

sum_(3,4).run(); // nothing log

sum_(5,6).run(cb); // log result


// Use with another generator functions

function* cube_ (num) {
    return num * num * num;
}

function* calc_ (a, b) {
    return (yield cube_(a)) + (yield cube_(b));
}

calc_(2,3).run(cb);


// Use with object + generator functions

function User (name) {
    this.name = name;
}

User.prototype.name = null;
User.prototype.getName_ = function* () {
    return this.name;
};

function* getName_ (user) {
   return yield* user.getName_();
}

var user = new User('TestName');

user.getName_().run(cb);  // dirrect get

getName_(user).run(cb);   // from another generator

// Use with dirrect callbacks in fiber

function sleep (time, cb) {
    setTimeout(cb, time);
}

function* timeoutCalc_ (time, a, b) {
    console.log('Waiting', time, 'ms');

    yield sleep(time, ycb());

    return a + b;
}

timeoutCalc_(1000, 3, 5).run(cb);

