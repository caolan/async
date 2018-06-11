import eachOf from '../eachOf';
import wrapAsync from './wrapAsync';

export default function doParallel(fn) {
    return (obj, iteratee, cb) => fn(eachOf, obj, wrapAsync(iteratee), cb);
}
