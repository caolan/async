'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = timeLimit;

var _mapLimit = require('./mapLimit');

var _mapLimit2 = _interopRequireDefault(_mapLimit);

var _range = require('../../deps/lodash-es/utility/range');

var _range2 = _interopRequireDefault(_range);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function timeLimit(count, limit, iterator, cb) {
    return (0, _mapLimit2.default)((0, _range2.default)(0, count), limit, iterator, cb);
}