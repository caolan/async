'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _reject = require('./internal/reject');

var _reject2 = _interopRequireDefault(_reject);

var _doSeries = require('./internal/doSeries');

var _doSeries2 = _interopRequireDefault(_doSeries);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _doSeries2.default)(_reject2.default);