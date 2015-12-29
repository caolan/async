'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = doWhilst;

var _whilst = require('./whilst');

var _whilst2 = _interopRequireDefault(_whilst);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function doWhilst(iterator, test, cb) {
    var calls = 0;
    return (0, _whilst2.default)(function () {
        return ++calls <= 1 || test.apply(this, arguments);
    }, iterator, cb);
}