'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = sortBy;

var _arrayMap = require('lodash/internal/arrayMap');

var _arrayMap2 = _interopRequireDefault(_arrayMap);

var _property = require('lodash/utility/property');

var _property2 = _interopRequireDefault(_property);

var _map = require('./map');

var _map2 = _interopRequireDefault(_map);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function sortBy(arr, iterator, cb) {
    (0, _map2.default)(arr, function (x, cb) {
        iterator(x, function (err, criteria) {
            if (err) return cb(err);
            cb(null, { value: x, criteria: criteria });
        });
    }, function (err, results) {
        if (err) return cb(err);
        cb(null, (0, _arrayMap2.default)(results.sort(comparator), (0, _property2.default)('value')));
    });

    function comparator(left, right) {
        var a = left.criteria,
            b = right.criteria;
        return a < b ? -1 : a > b ? 1 : 0;
    }
}