'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = eachOfLimit;

var _eachOfLimit2 = require('./internal/eachOfLimit');

var _eachOfLimit3 = _interopRequireDefault(_eachOfLimit2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function eachOfLimit(obj, limit, iterator, cb) {
    (0, _eachOfLimit3.default)(limit)(obj, iterator, cb);
}