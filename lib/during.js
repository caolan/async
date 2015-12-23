'use strict';

import noop from 'lodash/utility/noop';
import restParam from 'lodash/function/restParam';

export default function during(test, iterator, cb) {
    cb = cb || noop;

    var next = restParam(function(err, args) {
        if (err) {
            cb(err);
        } else {
            args.push(check);
            test.apply(this, args);
        }
    });

    var check = function(err, truth) {
        if (err) return cb(err);
        if (!truth) return cb(null);
        iterator(next);
    };

    test(check);
}
