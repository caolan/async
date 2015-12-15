'use strict';

var _setImmediate = typeof setImmediate === 'function' && setImmediate;
var fallback = function(fn) {
    setTimeout(fn, 0);
};

module.exports = function setImmediate(fn) {
    // not a direct alias for IE10 compatibility
    return (_setImmediate || fallback)(fn);
};
