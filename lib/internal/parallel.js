import noop from 'lodash/noop';
import isArrayLike from 'lodash/isArrayLike';
import isPlainObject from 'lodash/isPlainObject';
import rest from 'lodash/_baseRest';

export default function _parallel(eachfn, tasks, callback) {
    callback = callback || noop;
    var results = isArrayLike(tasks) ? [] : {};

    eachfn(tasks, function (task, key, callback) {
        if (isPlainObject(task)) {
            key = Object.keys(task)[0];
            task = task[key];
        }

        task(rest(function (err, args) {
            if (args.length <= 1) {
                args = args[0];
            }

            results[key] = args;

            callback(err);
        }));
    }, function (err) {
        callback(err, results);
    });
}
