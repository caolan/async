import isArray from 'lodash/isArray';
import noop from 'lodash/noop';
import once from './internal/once';
import rest from 'lodash/_baseRest';

import onlyOnce from './internal/onlyOnce';

/**
 * Runs the `tasks` array of functions in series, each passing their results to
 * the next in the array. However, if any of the `tasks` pass an error to their
 * own callback, the next function is not executed, and the main `callback` is
 * immediately called with the error.
 *
 * @name waterfall
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Array} tasks - An array of functions to run, each function is passed
 * a `callback(err, result1, result2, ...)` it must call on completion. The
 * first argument is an error (which can be `null`) and any further arguments
 * will be passed as arguments in order to the next task.
 * @param {Function} [callback] - An optional callback to run once all the
 * functions have completed. This will be passed the results of the last task's
 * callback. Invoked with (err, [results]).
 * @param {Array} [taskKeys] = An optional collection of keys for mapping the task to the `result` value.
 * @returns undefined
 * @example
 *
 * async.waterfall([
 *     function(callback) {
 *         callback(null, 'one', 'two');
 *     },
 *     function(arg1, arg2, callback) {
 *         // arg1 now equals 'one' and arg2 now equals 'two'
 *         callback(null, 'three');
 *     },
 *     function(arg1, callback) {
 *         // arg1 now equals 'three'
 *         callback(null, 'done');
 *     }
 * ], function (err, result) {
 *     // result now equals 'done'
 * });
 *
 * async.waterfall([
 *     function(callback) {
 *         callback(null, 'one', 'two');
 *     },
 *     function(result, callback) {
 *         // result.w[0] now equals 'one' and result.w[1] now equals 'two'
 *         callback(null, 'three');
 *     },
 *     function(result, callback) {
 *         // result.o now equals 'three'
 *         callback(null, 'four');
 *     },
 *     function(result, callback) {
 *         // result.o now equals 'four'
 *         callback(null, 'done');
 *     }
 * ], function (err, result) {
 *     // result now equals {'w': ['one', 'two'], 'o': 'four', 'd': 'done'}
 * },
 * ['w', 'o', 'o', 'd']);
 *
 * // Or, with named functions:
 * async.waterfall([
 *     myFirstFunction,
 *     mySecondFunction,
 *     myLastFunction,
 * ], function (err, result) {
 *     // result now equals 'done'
 * });
 * function myFirstFunction(callback) {
 *     callback(null, 'one', 'two');
 * }
 * function mySecondFunction(arg1, arg2, callback) {
 *     // arg1 now equals 'one' and arg2 now equals 'two'
 *     callback(null, 'three');
 * }
 * function myLastFunction(arg1, callback) {
 *     // arg1 now equals 'three'
 *     callback(null, 'done');
 * }
 *
 * // break in the middle
 * async.waterfall([
 *     function(callback, done) {
 *         callback(null, 'one', 'two');
 *     },
 *     function(result, callback, done) {
 *         // result.w[0] now equals 'one' and result.w[1] now equals 'two'
 *         callback(null, 'three');
 *     },
 *     function(result, callback, done) {
 *         // result.o now equals 'three'
 *         done(null, 'four');
 *     },
 *     function(result, callback, done) {
 *         // result.o now equals 'four'
 *         callback(null, 'done');
 *     }
 * ], function (err, result) {
 *     // result now equals {'w': ['one', 'two'], 'o': 'four'}
 * },
 * ['w', 'o', 'o', 'd']);
 */
export default function (tasks, callback, taskKeys) {
    if (isArray(callback)) {
        taskKeys = callback;
        callback = once(noop);
    } else {
        callback = once(callback || noop);
    }
    
    if (!isArray(tasks)) return callback(new Error('First argument to waterfall must be an array of functions'));
    if (isArray(taskKeys) && tasks.length !== taskKeys.length) return callback(new Error('#taskKeys must be equal to #tasks'));
    if (!tasks.length) return callback();

    var result = {},
        taskIndex = 0;

    function updateResult(args) {
        if (taskKeys) {
            if (args.length === 0) {
                args = null;
            } else if (args.length === 1) {
                args = args[0];
            }

            result[taskKeys[taskIndex - 1]] = args;
            args = [result];
        }

        return args;
    }

    function done(err, args) {
        return callback.apply(null, [err].concat(updateResult(args)));
    }

    function nextTask(args) {
        if (taskIndex === tasks.length) {
            return callback.apply(null, [null].concat(args));
        }

        var taskCallback = onlyOnce(rest(function(err, args) {
            if (err) {
                return callback.apply(null, [err].concat(args));
            }

            nextTask(updateResult(args));
        }));

        args.push(taskCallback);
        args.push(done);

        var task = tasks[taskIndex++];
        task.apply(null, args);
    }

    nextTask([]);
}
