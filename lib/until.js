'use strict';

import whilst from './whilst';

export default function until(test, iteratee, cb) {
    return whilst(function() {
        return !test.apply(this, arguments);
    }, iteratee, cb);
}
