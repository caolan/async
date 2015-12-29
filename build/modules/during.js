'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = during;

var _noop = require('lodash/utility/noop');

var _noop2 = _interopRequireDefault(_noop);

var _rest = require('lodash/function/rest');

var _rest2 = _interopRequireDefault(_rest);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function during(test, iterator, cb) {
    cb = cb || _noop2.default;

    var next = (0, _rest2.default)(function (err, args) {
        if (err) {
            cb(err);
        } else {
            args.push(check);
            test.apply(this, args);
        }
    });

    var check = function (err, truth) {
        if (err) return cb(err);
        if (!truth) return cb(null);
        iterator(next);
    };

    test(check);
}