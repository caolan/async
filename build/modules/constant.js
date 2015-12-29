'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _rest = require('../../deps/lodash-es/function/rest');

var _rest2 = _interopRequireDefault(_rest);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _rest2.default)(function (values) {
    var args = [null].concat(values);
    return function (cb) {
        return cb.apply(this, args);
    };
});