/**
 * Created by encobrain on 15.10.16.
 */

var fcb = require('../index').cb;

function sleep (timeout_ms) {
    var now = Date.now(),
        cb = fcb()
        ;

    function next () {
        cb(null, Date.now() - now);
    }

    if (timeout_ms) setTimeout(next, timeout_ms);
    else setImmediate(next);
}

module.exports = sleep;
