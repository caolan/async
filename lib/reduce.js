'use strict';

import eachOfSeries from './eachOfSeries';

export default function reduce(arr, memo, iteratee, cb) {
    eachOfSeries(arr, function(x, i, cb) {
        iteratee(memo, x, function(err, v) {
            memo = v;
            cb(err);
        });
    }, function(err) {
        cb(err, memo);
    });
}
