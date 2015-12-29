'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = _asyncMap;

var _isArrayLike = require('../../../deps/lodash-es/lang/isArrayLike');

var _isArrayLike2 = _interopRequireDefault(_isArrayLike);

var _noop = require('../../../deps/lodash-es/utility/noop');

var _noop2 = _interopRequireDefault(_noop);

var _once = require('../../../deps/lodash-es/function/once');

var _once2 = _interopRequireDefault(_once);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncMap(eachfn, arr, iterator, callback) {
    callback = (0, _once2.default)(callback || _noop2.default);
    arr = arr || [];
    var results = (0, _isArrayLike2.default)(arr) ? [] : {};
    eachfn(arr, function (value, index, callback) {
        iterator(value, function (err, v) {
            results[index] = v;
            callback(err);
        });
    }, function (err) {
        callback(err, results);
    });
}