import eachOf from '../eachOf';
import wrapAsync from './wrapAsync';

export default function doParallel(fn) {
    return function (obj, iteratee, callback) {
        return fn(eachOf, obj, wrapAsync(iteratee), callback);
    };
}
