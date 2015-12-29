'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = reduceRight;

var _toArray = require('../../deps/lodash-es/lang/toArray');

var _toArray2 = _interopRequireDefault(_toArray);

var _reduce = require('./reduce');

var _reduce2 = _interopRequireDefault(_reduce);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function reduceRight(arr, memo, iterator, cb) {
    var reversed = (0, _toArray2.default)(arr).reverse();
    (0, _reduce2.default)(reversed, memo, iterator, cb);
}