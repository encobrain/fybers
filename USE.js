var fybers = require('./index'),
    fcb = fybers.cb;

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

    if (err) return console.log('Error:', err);

    console.log(result);
}

//sum_(1).run();  // throws error to node

//sum_(2).run(cb); // throws error to cb

sum_(3,4).run(); // nothing log

sum_(5,6).run(cb); // log result: 11


// Use with another generator functions

function* cube_ (num) {
    return num * num * num;
}

function* calc_ (a, b) {
    return (yield* cube_(a)) + (yield* cube_(b));
}

calc_(2,3).run(cb); // log result: 35


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

user.getName_().run(cb);  // dirrect get // log result: TestName

getName_(user).run(cb);   // from another generator // log result: TestName

// Use with dirrect callbacks in fiber

function sleep (time, cb) {
    setTimeout(cb, time);
}

function* timeoutCalc_ (time, a, b) {
    console.log('Waiting', time, 'ms');

    yield sleep(time, fcb());

    return a + b;
}

timeoutCalc_(1000, 3, 15).run(cb);

// Throw error thrown 3 callback

function* do1_ () {
    try {
        yield* do2_();
    } catch (err) {
        console.log('Catched error in do1:', err)
    }

    return 'Catched error';
}

function* do2_ () {
    yield* do3_();
}

function* do3_ () {
    throw new Error('Do3 error');
}

do1_().run(cb);

