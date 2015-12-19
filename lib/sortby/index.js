'use strict';

var map = require('async.util.map');
var mapAsync = require('async.map');

module.exports = function sortBy (arr, iterator, cb) {
    mapAsync(arr, function (x, cb) {
        iterator(x, function (err, criteria) {
            if (err) return cb(err);
            cb(null, {value: x, criteria: criteria});
        });
    }, function (err, results) {
        if (err) return cb(err);
        cb(null, map(results.sort(comparator), function (x) {
            return x.value;
        }));
    });

    function comparator(left, right) {
        var a = left.criteria, b = right.criteria;
        return a < b ? -1 : a > b ? 1 : 0;
    }
};
