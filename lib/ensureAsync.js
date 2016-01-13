'use strict';

import rest from 'lodash/rest';

import setImmediate from './internal/setImmediate';

export default function ensureAsync(fn) {
    return rest(function (args) {
        var callback = args.pop();
        var sync = true;
        args.push(function () {
            var innerArgs = arguments;
            if (sync) {
                setImmediate(function () {
                    callback.apply(null, innerArgs);
                });
            } else {
                callback.apply(null, innerArgs);
            }
        });
        fn.apply(this, args);
        sync = false;
    });
}
