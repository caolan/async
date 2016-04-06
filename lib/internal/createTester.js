'use strict';
import noop from 'lodash/noop';

export default function _createTester(eachfn, check, getResult) {
    return function(arr, limit, iteratee, cb) {
        function done(err) {
            if (cb) {
                if (err) {
                    cb(err);
                } else {
                    cb(null, getResult(false));
                }
            }
        }
        function wrappedIteratee(x, _, callback) {
            if (!cb) return callback();
            iteratee(x, function (err, v) {
                if (cb) {
                    if (err) {
                        cb(err);
                        cb = iteratee = false;
                    } else if (check(v)) {
                        cb(null, getResult(true, x));
                        cb = iteratee = false;
                    }
                }
                callback();
            });
        }
        if (arguments.length > 3) {
            cb = cb || noop;
            eachfn(arr, limit, wrappedIteratee, done);
        } else {
            cb = iteratee;
            cb = cb || noop;
            iteratee = limit;
            eachfn(arr, wrappedIteratee, done);
        }
    };
}
