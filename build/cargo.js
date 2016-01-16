'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = cargo;

var _queue = require('./internal/queue');

var _queue2 = _interopRequireDefault(_queue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function cargo(worker, payload) {
    return (0, _queue2.default)(worker, 1, payload);
}
module.exports = exports['default'];