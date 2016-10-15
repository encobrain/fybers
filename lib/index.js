var global = (function () { return this; })(),
    _Error = global.Error,
    stackRe = new RegExp ('\\n^\\s+at next \\(native\\)|\\n\\s+at[^(]+\\(' + __dirname + '/.*?:\\d+:\\d+\\)','gm'),
    generator = (function*(){})(),
    generatorPrototype = generator.constructor.prototype,
    _next = generatorPrototype.next,
    _throw =generatorPrototype.throw,
    currGen = null
    ;

function Error (msg) {
    var error = new _Error(msg);

    error.stack = error.stack.replace(stackRe, '');

    return error;
}

Error.prototype = _Error.prototype;

global.Error = Error;

function cb () {
    var gen = currGen;

    return function (err,res) {
        err != null ? gen.throw(err) : gen.next(res);
    };
}


function next () {
    currGen = this;

    try {
        var ret = _next.apply(this, arguments);
    } catch (err) { this.__cb(err) }

    return ret && ret.done ? this.__cb(null, ret.value) : ret;
}

function throww () {
    currGen = this;

    try {
        var ret = _throw.apply(this, arguments);
    } catch (err) { this.__cb(err) }

    return ret && ret.done ? this.__cb(null, ret.value) : ret;
}

function run (callback) {
    callback = callback || function (err) { if (err) throw err; };

    this.throw = throww;
    this.next = next;

    this.__cb = callback;

    setImmediate(function(gen){ gen.next(); }, this)
}

generatorPrototype.run = run;

module.exports.cb = cb;