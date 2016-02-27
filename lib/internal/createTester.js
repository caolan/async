'use strict';

export default function _createTester(eachfn, check, getResult) {
    return function(arr, limit, iterator, cb) {
        function done(err) {
            if (cb) {
                if (err) {
                    cb(err);
                } else {
                    cb(null, getResult(false));
                }
            }
        }
        function iteratee(x, _, callback) {
            if (!cb) return callback();
            iterator(x, function (err, v) {
                if (cb) {
                    if (err) {
                        cb(err);
                        cb = iterator = false;
                    } else if (check(v)) {
                        cb(null, getResult(true, x));
                        cb = iterator = false;
                    }
                }
                callback();
            });
        }
        if (arguments.length > 3) {
            eachfn(arr, limit, iteratee, done);
        } else {
            cb = iterator;
            iterator = limit;
            eachfn(arr, iteratee, done);
        }
    };
}
