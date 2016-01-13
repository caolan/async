'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = compose;

var _seq = require('./seq');

var _seq2 = _interopRequireDefault(_seq);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var reverse = Array.prototype.reverse;

function compose() /* functions... */{
    return _seq2.default.apply(null, reverse.call(arguments));
}
module.exports = exports['default'];