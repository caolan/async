'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _setImmediate = require('./internal/setImmediate');

var _setImmediate2 = _interopRequireDefault(_setImmediate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var nexTick = typeof process === 'object' && typeof process.nextTick === 'function' ? process.nextTick : _setImmediate2.default;

exports.default = nexTick;
module.exports = exports['default'];