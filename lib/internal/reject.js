'use strict';

import filter from './filter';

export default function reject(eachfn, arr, iterator, callback) {
    filter(eachfn, arr, function(value, cb) {
        iterator(value, function(err, v) {
            if (err) {
                cb(err);
            } else {
                cb(null, !v);
            }
        });
    }, callback);
}
