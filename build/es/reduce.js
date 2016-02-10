'use strict';

import eachOfSeries from './eachOfSeries';

export default function reduce(arr, memo, iterator, cb) {
    eachOfSeries(arr, function(x, i, cb) {
        iterator(memo, x, function(err, v) {
            memo = v;
            cb(err);
        });
    }, function(err) {
        cb(err, memo);
    });
}
