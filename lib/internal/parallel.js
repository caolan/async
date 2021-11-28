import isArrayLike from './isArrayLike.js'
import wrapAsync from './wrapAsync.js'
import awaitify from './awaitify.js'

export default awaitify((eachfn, tasks, callback) => {
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
}, 3)
