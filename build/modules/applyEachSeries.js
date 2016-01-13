'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _applyEach = require('./internal/applyEach');

var _applyEach2 = _interopRequireDefault(_applyEach);

var _eachOfSeries = require('./eachOfSeries');

var _eachOfSeries2 = _interopRequireDefault(_eachOfSeries);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _applyEach2.default)(_eachOfSeries2.default);
module.exports = exports['default'];