'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _applyEach = require('./internal/applyEach');

var _applyEach2 = _interopRequireDefault(_applyEach);

var _eachOf = require('./eachOf');

var _eachOf2 = _interopRequireDefault(_eachOf);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _applyEach2.default)(_eachOf2.default);
module.exports = exports['default'];