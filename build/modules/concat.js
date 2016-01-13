'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _concat = require('./internal/concat');

var _concat2 = _interopRequireDefault(_concat);

var _doParallel = require('./internal/doParallel');

var _doParallel2 = _interopRequireDefault(_doParallel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _doParallel2.default)(_concat2.default);
module.exports = exports['default'];