'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _reject = require('./internal/reject');

var _reject2 = _interopRequireDefault(_reject);

var _doParallel = require('./internal/doParallel');

var _doParallel2 = _interopRequireDefault(_doParallel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _doParallel2.default)(_reject2.default);
module.exports = exports['default'];