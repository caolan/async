import eachOfLimit from './internal/eachOfLimit.js'
import parallel from './internal/parallel.js'

/**
 * The same as [`parallel`]{@link module:ControlFlow.parallel} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name parallelLimit
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.parallel]{@link module:ControlFlow.parallel}
 * @category Control Flow
 * @param {Array|Iterable|AsyncIterable|Object} tasks - A collection of
 * [async functions]{@link AsyncFunction} to run.
 * Each async function can complete with any number of optional `result` values.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {Function} [callback] - An optional callback to run once all the
 * functions have completed successfully. This function gets a results array
 * (or object) containing all the result arguments passed to the task callbacks.
 * Invoked with (err, results).
 * @returns {Promise} a promise, if a callback is not passed
 * @example
 *
 * // Run at most two tasks at a time. Results stay in task order.
 * async.parallelLimit([
 *     function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'one');
 *         }, 200);
 *     },
 *     function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'two');
 *         }, 100);
 *     },
 *     function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'three');
 *         }, 50);
 *     }
 * ], 2, function(err, results) {
 *     if (err) throw err;
 *     console.log(results);
 *     // [ 'one', 'two', 'three' ]
 * });
 *
 * // Omit the callback and parallelLimit returns a Promise.
 * const results = await async.parallelLimit([
 *     async function() { return 'one'; },
 *     async function() { return 'two'; },
 *     async function() { return 'three'; }
 * ], 2);
 * console.log(results);
 * // [ 'one', 'two', 'three' ]
 */
export default function parallelLimit(tasks, limit, callback) {
    return parallel(eachOfLimit(limit), tasks, callback);
}
