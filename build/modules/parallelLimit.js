'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = parallelLimit;

var _eachOfLimit = require('./internal/eachOfLimit');

var _eachOfLimit2 = _interopRequireDefault(_eachOfLimit);

var _parallel = require('./internal/parallel');

var _parallel2 = _interopRequireDefault(_parallel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parallelLimit(tasks, limit, cb) {
    return (0, _parallel2.default)((0, _eachOfLimit2.default)(limit), tasks, cb);
}
module.exports = exports['default'];