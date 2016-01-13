'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = series;

var _parallel = require('./internal/parallel');

var _parallel2 = _interopRequireDefault(_parallel);

var _eachOfSeries = require('./eachOfSeries');

var _eachOfSeries2 = _interopRequireDefault(_eachOfSeries);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function series(tasks, cb) {
    return (0, _parallel2.default)(_eachOfSeries2.default, tasks, cb);
}
module.exports = exports['default'];