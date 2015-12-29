'use strict';

import noop from '../../../deps/lodash-es/utility/noop';
import isArrayLike from '../../../deps/lodash-es/lang/isArrayLike';
import rest from '../../../deps/lodash-es/function/rest';

export default function _parallel(eachfn, tasks, callback) {
    callback = callback || noop;
    var results = isArrayLike(tasks) ? [] : {};

    eachfn(tasks, function (task, key, callback) {
        task(rest(function (err, args) {
            if (args.length <= 1) {
                args = args[0];
            }
            results[key] = args;
            callback(err);
        }));
    }, function (err) {
        callback(err, results);
    });
}