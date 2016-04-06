'use strict';

import isArray from 'lodash/isArray';

import eachOf from './eachOf';

export default function transform (arr, memo, iteratee, callback) {
    if (arguments.length === 3) {
        callback = iteratee;
        iteratee = memo;
        memo = isArray(arr) ? [] : {};
    }

    eachOf(arr, function(v, k, cb) {
        iteratee(memo, v, k, cb);
    }, function(err) {
        callback(err, memo);
    });
}
