'use strict';

import doWhilst from './doWhilst';

export default function doUntil(iteratee, test, cb) {
    return doWhilst(iteratee, function() {
        return !test.apply(this, arguments);
    }, cb);
}
