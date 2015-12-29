'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _rest = require('lodash/function/rest');

var _rest2 = _interopRequireDefault(_rest);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _rest2.default)(function (fn, args) {
    return (0, _rest2.default)(function (callArgs) {
        return fn.apply(null, args.concat(callArgs));
    });
});