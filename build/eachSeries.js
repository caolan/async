'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = eachSeries;

var _eachOfSeries = require('./eachOfSeries');

var _eachOfSeries2 = _interopRequireDefault(_eachOfSeries);

var _withoutIndex = require('./internal/withoutIndex');

var _withoutIndex2 = _interopRequireDefault(_withoutIndex);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function eachSeries(arr, iterator, cb) {
    return (0, _eachOfSeries2.default)(arr, (0, _withoutIndex2.default)(iterator), cb);
}
module.exports = exports['default'];