'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _filter = require('./internal/filter');

var _filter2 = _interopRequireDefault(_filter);

var _doParallel = require('./internal/doParallel');

var _doParallel2 = _interopRequireDefault(_doParallel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _doParallel2.default)(_filter2.default);
module.exports = exports['default'];