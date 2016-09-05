import isArray from 'lodash/isArray';
import isPlainObject from 'lodash/isPlainObject';
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
 *     {
 *         'w': function(callback) {
 *             callback(null, 'one', 'two');
 *         }
 *     },
 *     {
 *         'o': function(result, callback) {
 *             // result.w[0] now equals 'one' and result.w[1] now equals 'two'
 *             callback(null, 'three');
 *         }
 *     },
 *     {
 *         'o': function(result, callback) {
 *             // result.o now equals 'three'
 *             callback(null, 'four');
 *         }
 *     },
 *     {
 *         'd': function(result, callback) {
 *             // result.o now equals 'four'
 *             callback(null, 'done');
 *          }
 *     }
 * ], function (err, result) {
 *     // result now equals {'w': ['one', 'two'], 'o': 'four', 'd': 'done'}
 * });
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
 */
export default  function(tasks, callback) {
    callback = once(callback || noop);
    if (!isArray(tasks)) return callback(new Error('First argument to waterfall must be an array of functions'));
    if (!tasks.length) return callback();
    
    var taskIndex = 0,
        _isPlainObject = false,
        result = {},
        key = null;

    function nextTask(args) {
        if (taskIndex === tasks.length) {
            return callback.apply(null, [null].concat(args));
        }

        var taskCallback = onlyOnce(rest(function(err, args) {
            if (err) {
                return callback.apply(null, [err].concat(args));
            }

            if (_isPlainObject) {
                if (args.length === 0) {
                    args = null;
                } else if (args.length === 1) {
                    args = args[0];
                }

                result[key] = args;
                args = [result];
            }

            nextTask(args);
        }));

        args.push(taskCallback);

        var task = tasks[taskIndex++];
        if (_isPlainObject = isPlainObject(task)) {
            key = Object.keys(task)[0];
            task = task[key];
        }
        task.apply(null, args);
    }

    nextTask([]);
}
