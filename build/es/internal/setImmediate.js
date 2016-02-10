'use strict';

var _setImmediate = typeof setImmediate === 'function' && setImmediate;

var _delay;
if (_setImmediate) {
    _delay = function(fn) {
        // not a direct alias for IE10 compatibility
        _setImmediate(fn);
    };
} else if (typeof process === 'object' && typeof process.nextTick === 'function') {
    _delay = process.nextTick;
} else {
    _delay = function(fn) {
        setTimeout(fn, 0);
    };
}

export default _delay;
