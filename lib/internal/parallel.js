import isArrayLike from './isArrayLike';
import noop from './noop';
import wrapAsync from './wrapAsync';

export default function _parallel(eachfn, tasks, callback) {
    callback = callback || noop;
    var results = isArrayLike(tasks) ? [] : {};

    eachfn(tasks, (task, key, taskCb) => {
        wrapAsync(task)((err, ...result) => {
            if (result.length < 2) {
                [result] = result;
            }
            results[key] = result;
            taskCb(err);
        });
    }, err => callback(err, results));
}
