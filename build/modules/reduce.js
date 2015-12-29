'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = reduce;

var _eachOfSeries = require('./eachOfSeries');

var _eachOfSeries2 = _interopRequireDefault(_eachOfSeries);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function reduce(arr, memo, iterator, cb) {
    (0, _eachOfSeries2.default)(arr, function (x, i, cb) {
        iterator(memo, x, function (err, v) {
            memo = v;
            cb(err);
        });
    }, function (err) {
        cb(err, memo);
    });
}