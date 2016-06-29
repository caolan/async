import eachOfLimit from './internal/eachOfLimit';
import parallel from './internal/parallel';

/**
 * The same as `parallel` but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name parallel
 * @static
 * @memberOf module:async
 * @method
 * @see [async.parallel]{@link module:async.parallel}
 * @category Control Flow
 * @param {Array|Collection} tasks - A collection containing functions to run.
 * Each function is passed a `callback(err, result)` which it must call on
 * completion with an error `err` (which can be `null`) and an optional `result`
 * value.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {Function} [callback] - An optional callback to run once all the
 * functions have completed successfully. This function gets a results array
 * (or object) containing all the result arguments passed to the task callbacks.
 * Invoked with (err, results).
 */
export default function parallelLimit(tasks, limit, callback) {
    parallel(eachOfLimit(limit), tasks, callback);
}
