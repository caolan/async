import eachOfLimit from './eachOfLimit';
import wrapAsync from './wrapAsync';

export default function doParallelLimit(fn) {
    return function (obj, limit, iteratee, callback) {
        return fn(eachOfLimit(limit), obj, wrapAsync(iteratee), callback);
    };
}
