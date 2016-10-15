var fybers = require('./index'),
    fcb = fybers.cb,
    future = fybers.future,
    sleep = fybers.sleep
    ;

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

function wait (time, cb) {
    setTimeout(cb, time);
}

function* timeoutCalc_ (time, a, b) {
    console.log('Waiting', time, 'ms');

    yield wait(time, fcb());

    return a + b;
}

timeoutCalc_(1000, 3, 15).run(cb);   // log result: 18

// Throw error thrown 3 callback & sleep use

function* do1_ () {
    try {
        yield* do2_();
    } catch (err) {
        console.log('Catched error in do1:', err)
    }

    return 'Catched error';
}

function* do2_ () {
    console.log('sleep 2s');

    yield sleep(2000);

    yield* do3_();
}

function* do3_ () {
    throw new Error('do3 error');
}

do1_().run(cb);  // log error: Catched error in do1: Error: do3 error

// Parallel run with callbacks

function pdo1 (cb) {
    console.log('pdo1 runned');

    setTimeout(function (){ cb(null, 10) }, 4000);
}

function pdo2 (cb) {
    console.log('pdo2 runned');

    setTimeout(function () { cb(null, 23) }, 3000);
}


function* parralelCbCalc () {

    var r1 = future(),
        r2 = future();

    console.log('Running parralel cbs');

    pdo1(r1.cb);
    pdo2(r2.cb);

    console.log('Waiting parallel cb results');
    r2 = yield* r2;
    console.log('pdo2 done');
    r1 = yield* r1;
    console.log('pdo1 done');

    return r2 + r1;
}

parralelCbCalc().run(cb);  // log result: 33

// Parallel run with generator fns

function* pdo1_ () {
    console.log('pdo1_ runned');

    yield sleep(6000);

    return 24;
}

function* pdo2_ () {
    console.log('pdo2_ runned');

    yield sleep(5000);

    return 37;
}

function* parralelGenCalc () {

    var r1 = future(),
        r2 = future();

    console.log('Running parallel gens');

    pdo1_().run(r1.cb);
    pdo2_().run(r2.cb);

    console.log('Waiting parallel gens results');
    r2 = yield* r2;
    console.log('pdo2_ done');
    r1 = yield* r1;
    console.log('pdo1_ done');

    return r2 + r1;
}

parralelGenCalc().run(cb); // log result: 61


