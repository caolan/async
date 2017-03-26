import noop from 'lodash/noop';
import isArrayLike from 'lodash/isArrayLike';
import rest from './rest';

export default function _parallel(eachfn, tasks, callback, taskKeys) {
    callback = callback || noop;
    var results = isArrayLike(tasks) ? [] : {};

    if (taskKeys && tasks.length !== taskKeys.length) return callback(new Error('#taskKeys must be equal to #tasks'));

    var hasTaskKeys = isArrayLike(taskKeys); 
    if (hasTaskKeys) {
        results = {};
    }

    eachfn(tasks, function (task, key, callback) {
        task(rest(function (err, args) {
            if (args.length <= 1) {
                args = args[0];
            }

            if (hasTaskKeys) {
                key = taskKeys[key];
            }

            results[key] = args;
            callback(err);
        }));
    }, function (err) {
        callback(err, results);
    });
}
