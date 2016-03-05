'use strict';

export default function doLimit(fn, limit) {
    return function (iterable, iterator, callback) {
        return fn(iterable, limit, iterator, callback);
    };
}
