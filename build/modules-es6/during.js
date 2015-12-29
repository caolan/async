'use strict';

import noop from '../../deps/lodash-es/utility/noop';
import rest from '../../deps/lodash-es/function/rest';

export default function during(test, iterator, cb) {
    cb = cb || noop;

    var next = rest(function (err, args) {
        if (err) {
            cb(err);
        } else {
            args.push(check);
            test.apply(this, args);
        }
    });

    var check = function (err, truth) {
        if (err) return cb(err);
        if (!truth) return cb(null);
        iterator(next);
    };

    test(check);
}