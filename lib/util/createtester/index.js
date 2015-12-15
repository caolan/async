'use strict';

module.exports = function createTester(eachfn, check, getResult) {
    return function(arr, limit, iterator, cb) {
        function done() {
            if (cb) cb(getResult(false, void 0));
        }

        function iteratee(x, _, callback) {
            if (!cb) return callback();
            iterator(x, function(v) {
                if (cb && check(v)) {
                    cb(getResult(true, x));
                    cb = iterator = false;
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
};
