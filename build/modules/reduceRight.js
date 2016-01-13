'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = reduceRight;

var _reduce = require('./reduce');

var _reduce2 = _interopRequireDefault(_reduce);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var slice = Array.prototype.slice;

function reduceRight(arr, memo, iterator, cb) {
    var reversed = slice.call(arr).reverse();
    (0, _reduce2.default)(reversed, memo, iterator, cb);
}
module.exports = exports['default'];