'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (worker, concurrency) {
    return (0, _queue2.default)(function (items, cb) {
        worker(items[0], cb);
    }, concurrency, 1);
};

var _queue = require('./internal/queue');

var _queue2 = _interopRequireDefault(_queue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = exports['default'];