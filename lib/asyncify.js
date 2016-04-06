'use strict';

import isObject from 'lodash/isObject';
import initialParams from './internal/initialParams';

export default function asyncify(func) {
    return initialParams(function (args, callback) {
        var result;
        try {
            result = func.apply(this, args);
        } catch (e) {
            return callback(e);
        }
        // if result is Promise object
        if (isObject(result) && typeof result.then === 'function') {
            result.then(function(value) {
                callback(null, value);
            })['catch'](function(err) {
                callback(err.message ? err : new Error(err));
            });
        } else {
            callback(null, result);
        }
    });
}
