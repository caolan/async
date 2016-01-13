'use strict';

import isArray from 'lodash/isArray';

import eachOf from './eachOf';

export default function transform (arr, memo, iterator, callback) {
    if (arguments.length === 3) {
        callback = iterator;
        iterator = memo;
        memo = isArray(arr) ? [] : {};
    }

    eachOf(arr, function(v, k, cb) {
        iterator(memo, v, k, cb);
    }, function(err) {
        callback(err, memo);
    });
}
