'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = eachLimit;

var _eachOfLimit = require('./internal/eachOfLimit');

var _eachOfLimit2 = _interopRequireDefault(_eachOfLimit);

var _withoutIndex = require('./internal/withoutIndex');

var _withoutIndex2 = _interopRequireDefault(_withoutIndex);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function eachLimit(arr, limit, iterator, cb) {
    return (0, _eachOfLimit2.default)(limit)(arr, (0, _withoutIndex2.default)(iterator), cb);
}
module.exports = exports['default'];