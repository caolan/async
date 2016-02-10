'use strict';

import eachOfLimit from './eachOfLimit';

export default function doParallelLimit(fn) {
    return function (obj, limit, iterator, callback) {
        return fn(eachOfLimit(limit), obj, iterator, callback);
    };
}
