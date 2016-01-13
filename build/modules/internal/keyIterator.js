'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = keyIterator;

var _isArrayLike = require('lodash/isArrayLike');

var _isArrayLike2 = _interopRequireDefault(_isArrayLike);

var _keys = require('lodash/keys');

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function keyIterator(coll) {
    var i = -1;
    var len;
    if ((0, _isArrayLike2.default)(coll)) {
        len = coll.length;
        return function next() {
            i++;
            return i < len ? i : null;
        };
    } else {
        var okeys = (0, _keys2.default)(coll);
        len = okeys.length;
        return function next() {
            i++;
            return i < len ? okeys[i] : null;
        };
    }
}
module.exports = exports['default'];