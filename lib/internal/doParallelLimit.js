import eachOfLimit from './eachOfLimit';

export default function doParallelLimit(fn) {
    return function (obj, limit, iteratee, callback) {
        return fn(eachOfLimit(limit), obj, iteratee, callback);
    };
}
