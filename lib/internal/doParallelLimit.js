import eachOfLimit from './eachOfLimit';
import wrapAsync from './wrapAsync';

export default function doParallelLimit(fn) {
    return (obj, limit, iteratee, cb) => fn(eachOfLimit(limit), obj, wrapAsync(iteratee), cb);
}
