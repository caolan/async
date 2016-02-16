'use strict';

import eachOfSeries from '../eachOfSeries';

export default function doSeries(fn) {
    return function (obj, iterator, callback) {
        return fn(eachOfSeries, obj, iterator, callback);
    };
}
