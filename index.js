var global = (function () { return this; })(),
    _Error = global.Error,
    stackRe = new RegExp ('\\n^\\s+at next \\(native\\)|\\n\\s+at[^(]+\\(' + __filename + ':\\d+:\\d+\\)','gm'),
    generator = (function*(){})(),
    generatorPrototype = generator.constructor.prototype,
    _next = generatorPrototype.next,
    fybers = module.exports
    ;

function Error (msg) {
    var error = new _Error(msg);

    error.stack = error.stack.replace(stackRe, '');

    return error;
}

Error.prototype = _Error.prototype;

global.Error = Error;


function run (callback) {
    callback = callback || function (err) { if (err) throw err; };

    var fyber = fybers.current = this,
        result = fyber.next();

    while (!result.done) {

        if (result.value && result.value.constructor == generator.constructor) {
            result.value.run(function(err, res) { if (err)  })
        }
    }
}

function next () {
    fybers.current = this;

    return _next.apply(this, arguments);
}

generatorPrototype.run = run;
generatorPrototype.next = next;

function ycb () {
    var fyber = fybers.current;

    return function (err, res) {
        if (err) fyber.throw(err);
        else fyber.next(res);
    }
}

fybers.ycb = ycb;