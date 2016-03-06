'use strict';

import doWhilst from './doWhilst';

export default function doUntil(iterator, test, cb) {
    return doWhilst(iterator, function() {
        return !test.apply(this, arguments);
    }, cb);
}
