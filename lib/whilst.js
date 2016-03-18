'use strict';

import noop from 'lodash/noop';
import rest from 'lodash/rest';

export default function whilst(test, iteratee, cb) {
    cb = cb || noop;
    if (!test()) return cb(null);
    var next = rest(function(err, args) {
        if (err) return cb(err);
        if (test.apply(this, args)) return iteratee(next);
        cb.apply(null, [null].concat(args));
    });
    iteratee(next);
}
