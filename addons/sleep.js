/**
 * Created by encobrain on 15.10.16.
 */

var fcb = require('../index').cb;

function* sleep_ (timeout_ms) {
    var now = Date.now(),
        cb = fcb()
        ;

    function next () {
        cb(null, Date.now() - now);
    }

    setTimeout(next, timeout_ms);
}

module.exports.sleep_ = sleep_;
