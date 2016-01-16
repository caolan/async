'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _filter = require('./internal/filter');

var _filter2 = _interopRequireDefault(_filter);

var _doParallelLimit = require('./internal/doParallelLimit');

var _doParallelLimit2 = _interopRequireDefault(_doParallelLimit);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _doParallelLimit2.default)(_filter2.default);
module.exports = exports['default'];