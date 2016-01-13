'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = transform;

var _isArray = require('lodash/lang/isArray');

var _isArray2 = _interopRequireDefault(_isArray);

var _eachOf = require('./eachOf');

var _eachOf2 = _interopRequireDefault(_eachOf);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function transform(arr, memo, iterator, callback) {
    if (arguments.length === 3) {
        callback = iterator;
        iterator = memo;
        memo = (0, _isArray2.default)(arr) ? [] : {};
    }

    (0, _eachOf2.default)(arr, function (v, k, cb) {
        iterator(memo, v, k, cb);
    }, function (err) {
        callback(err, memo);
    });
}
module.exports = exports['default'];