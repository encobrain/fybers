/**
 * Created by encobrain on 15.10.16.
 */

var fcb = require('../index').cb;

function future () {
    var error, result, done, cb;

    function* future_ () {
        if (!done) {
            cb = fcb();

            yield 0;
        }

        if (error) throw error;

        return result;
    }

    var f = future_();

    f.cb = function (err, res) {
        error = err;
        result = res;
        done = true;
        if (cb) cb();
    };

    return f;
}

module.exports = future;


