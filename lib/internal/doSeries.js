import eachOfSeries from '../eachOfSeries';
import wrapAsync from './wrapAsync';

export default function doSeries(fn) {
    return function (obj, iteratee, callback) {
        return fn(eachOfSeries, obj, wrapAsync(iteratee), callback);
    };
}
