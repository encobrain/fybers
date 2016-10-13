var global = (function () { return this; })(),
    _Error = global.Error,
    stackRe = new RegExp ('\\n^\\s+at next \\(native\\)|\\n\\s+at[^(]+\\(' + __filename + ':\\d+:\\d+\\)','gm'),
    generatorPrototype = (function*(){})().constructor.prototype,
    _next = generatorPrototype.next,
    currFyber = null
    ;

function Error (msg) {
    var error = new _Error(msg);

    console.log(stackRe);
    error.stack = error.stack.replace(stackRe, '');

    return error;
}

Error.prototype = _Error.prototype;

global.Error = Error;

function* run_ (fyber, cb) {
    try {
        cb(null, yield* fyber);
    } catch (err) {
        cb(err);
    }
}

function run (callback) {
    callback = callback || function (err) { if (err) throw err; };

    _next.call(run_(this, callback));
}

function next () {
    var prevFyber = currFyber;
    currFyber = this;

    var ret = _next.apply(this, arguments);

    currFyber = prevFyber;
    return ret;
}

generatorPrototype.run = run;
generatorPrototype.next = next;