'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = _withoutIndex;
function _withoutIndex(iterator) {
    return function (value, index, callback) {
        return iterator(value, callback);
    };
}
module.exports = exports['default'];