'use strict';
import rest from 'lodash/rest';

var _setImmediate = typeof setImmediate === 'function' && setImmediate;

var _defer;
if (typeof process === 'object' && typeof process.nextTick === 'function') {
    _defer = process.nextTick;
} else if (_setImmediate) {
    _defer = _setImmediate;
} else {
    _defer = function(fn) {
        setTimeout(fn, 0);
    };
}

export default rest(function (fn, args) {
    _defer(function () {
        fn.apply(null, args);
    });
});
