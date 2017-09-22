import noop from 'lodash/noop';
import isArrayLike from 'lodash/isArrayLike';
import slice from './slice';
import wrapAsync from './wrapAsync';

export default function _priorityRace(eachfn, tasks, callback) {
    callback = callback || noop;
    var results = isArrayLike(tasks) ? [] : {};
    var outerCallback = callback;
    var numPrioritized = tasks.filter(t => t.isPrioritized).length;
    var numDone = 0;

    eachfn(tasks, function (task, key, callback) {
        wrapAsync(task)(function (err, result) {
            if (arguments.length > 2) {
                result = slice(arguments, 1);
            }
            results[key] = result;
            if(task.isPrioritized && ++numDone === numPrioritized) {
                return outerCallback(err, results)
            }
            callback(err);
        });
    }, callback);
}
