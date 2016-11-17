'use strict';

import rest from './rest';

export var hasSetImmediate = typeof setImmediate === 'function' && setImmediate;
export var hasNextTick = typeof process === 'object' && typeof process.nextTick === 'function';

export function fallback(fn) {
    setTimeout(fn, 0);
}

export function wrap(defer) {
    return rest(function (fn, args) {
        defer(function () {
            fn.apply(null, args);
        });
    });
}

var _defer;

if (hasSetImmediate) {
    _defer = setImmediate;
} else if (hasNextTick) {
    _defer = process.nextTick;
} else {
    _defer = fallback;
}

export default wrap(_defer);
