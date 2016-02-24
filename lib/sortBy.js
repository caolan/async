'use strict';

import arrayMap from 'lodash/_arrayMap';
import property from 'lodash/_baseProperty';

import map from './map';

export default function sortBy (arr, iterator, cb) {
    map(arr, function (x, cb) {
        iterator(x, function (err, criteria) {
            if (err) return cb(err);
            cb(null, {value: x, criteria: criteria});
        });
    }, function (err, results) {
        if (err) return cb(err);
        cb(null, arrayMap(results.sort(comparator), property('value')));
    });

    function comparator(left, right) {
        var a = left.criteria, b = right.criteria;
        return a < b ? -1 : a > b ? 1 : 0;
    }
}
