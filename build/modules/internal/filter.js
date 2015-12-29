'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = _filter;

var _arrayMap = require('../../../deps/lodash-es/internal/arrayMap');

var _arrayMap2 = _interopRequireDefault(_arrayMap);

var _property = require('../../../deps/lodash-es/utility/property');

var _property2 = _interopRequireDefault(_property);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _filter(eachfn, arr, iterator, callback) {
    var results = [];
    eachfn(arr, function (x, index, callback) {
        iterator(x, function (v) {
            if (v) {
                results.push({ index: index, value: x });
            }
            callback();
        });
    }, function () {
        callback((0, _arrayMap2.default)(results.sort(function (a, b) {
            return a.index - b.index;
        }), (0, _property2.default)('value')));
    });
}