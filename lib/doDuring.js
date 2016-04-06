'use strict';

import during from './during';

export default function doDuring(iteratee, test, cb) {
    var calls = 0;

    during(function(next) {
        if (calls++ < 1) return next(null, true);
        test.apply(this, arguments);
    }, iteratee, cb);
}
