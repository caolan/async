'use strict';

import isArrayLike from 'lodash/isArrayLike';
import noop from 'lodash/noop';
import once from 'lodash/once';

export default function _asyncMap(eachfn, arr, iteratee, callback) {
    callback = once(callback || noop);
    arr = arr || [];
    var results = isArrayLike(arr) ? [] : {};
    eachfn(arr, function (value, index, callback) {
        iteratee(value, function (err, v) {
            results[index] = v;
            callback(err);
        });
    }, function (err) {
        callback(err, results);
    });
}
