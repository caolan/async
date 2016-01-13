'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createTester = require('./internal/createTester');

var _createTester2 = _interopRequireDefault(_createTester);

var _eachOf = require('./eachOf');

var _eachOf2 = _interopRequireDefault(_eachOf);

var _notId = require('./internal/notId');

var _notId2 = _interopRequireDefault(_notId);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _createTester2.default)(_eachOf2.default, _notId2.default, _notId2.default);
module.exports = exports['default'];