'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = doDuring;

var _during = require('./during');

var _during2 = _interopRequireDefault(_during);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function doDuring(iterator, test, cb) {
    var calls = 0;

    (0, _during2.default)(function (next) {
        if (calls++ < 1) return next(null, true);
        test.apply(this, arguments);
    }, iterator, cb);
}