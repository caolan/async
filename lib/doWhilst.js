'use strict';

import whilst from './whilst';

export default function doWhilst(iteratee, test, cb) {
    var calls = 0;
    return whilst(function() {
        return ++calls <= 1 || test.apply(this, arguments);
    }, iteratee, cb);
}
