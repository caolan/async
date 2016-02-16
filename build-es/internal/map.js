'use strict';

import isArrayLike from 'lodash-es/isArrayLike';
import noop from 'lodash-es/noop';
import once from 'lodash-es/once';

export default function _asyncMap(eachfn, arr, iterator, callback) {
    callback = once(callback || noop);
    arr = arr || [];
    var results = isArrayLike(arr) ? [] : {};
    eachfn(arr, function (value, index, callback) {
        iterator(value, function (err, v) {
            results[index] = v;
            callback(err);
        });
    }, function (err) {
        callback(err, results);
    });
}
