'use strict';

import eachOf from '../eachOf';

export default function doParallel(fn) {
    return function (obj, iterator, callback) {
        return fn(eachOf, obj, iterator, callback);
    };
}
