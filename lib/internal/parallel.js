import isArrayLike from './isArrayLike';
import noop from './noop';
import wrapAsync from './wrapAsync';

export default function _parallel(eachfn, tasks, callback) {
    callback = callback || noop;
    var results = isArrayLike(tasks) ? [] : {};

    eachfn(tasks, (task, key, callback) => {
        wrapAsync(task)((err, ...result) => {
            if (result.length < 2) {
                result = result[0];
            }
            results[key] = result;
            callback(err);
        });
    }, err => callback(err, results));
}
