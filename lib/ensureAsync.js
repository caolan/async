'use strict';

import restParam from 'lodash/function/restParam';

import setImmediate from './internal/setImmediate';

export default function ensureAsync(fn) {
    return restParam(function (args) {
        var callback = args.pop();
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
        var sync = true;
        fn.apply(this, args);
        sync = false;
    });
}
