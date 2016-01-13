'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = doUntil;

var _doWhilst = require('./doWhilst');

var _doWhilst2 = _interopRequireDefault(_doWhilst);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function doUntil(iterator, test, cb) {
    return (0, _doWhilst2.default)(iterator, function () {
        return !test.apply(this, arguments);
    }, cb);
}
module.exports = exports['default'];