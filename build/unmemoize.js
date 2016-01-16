'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = unmemoize;
function unmemoize(fn) {
    return function () {
        return (fn.unmemoized || fn).apply(null, arguments);
    };
}
module.exports = exports['default'];