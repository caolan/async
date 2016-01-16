'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _filter = require('./internal/filter');

var _filter2 = _interopRequireDefault(_filter);

var _doSeries = require('./internal/doSeries');

var _doSeries2 = _interopRequireDefault(_doSeries);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _doSeries2.default)(_filter2.default);
module.exports = exports['default'];