'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = ensureAsync;

var _rest = require('lodash/rest');

var _rest2 = _interopRequireDefault(_rest);

var _setImmediate = require('./internal/setImmediate');

var _setImmediate2 = _interopRequireDefault(_setImmediate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ensureAsync(fn) {
    return (0, _rest2.default)(function (args) {
        var callback = args.pop();
        var sync = true;
        args.push(function () {
            var innerArgs = arguments;
            if (sync) {
                (0, _setImmediate2.default)(function () {
                    callback.apply(null, innerArgs);
                });
            } else {
                callback.apply(null, innerArgs);
            }
        });
        fn.apply(this, args);
        sync = false;
    });
}
module.exports = exports['default'];