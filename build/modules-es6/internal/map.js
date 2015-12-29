'use strict';

import isArrayLike from '../../../deps/lodash-es/lang/isArrayLike';
import noop from '../../../deps/lodash-es/utility/noop';
import once from '../../../deps/lodash-es/function/once';

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