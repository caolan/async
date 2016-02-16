'use strict';

import whilst from './whilst';

export default function until(test, iterator, cb) {
    return whilst(function() {
        return !test.apply(this, arguments);
    }, iterator, cb);
}
