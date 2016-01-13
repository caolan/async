'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _map = require('./internal/map');

var _map2 = _interopRequireDefault(_map);

var _doSeries = require('./internal/doSeries');

var _doSeries2 = _interopRequireDefault(_doSeries);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _doSeries2.default)(_map2.default);
module.exports = exports['default'];