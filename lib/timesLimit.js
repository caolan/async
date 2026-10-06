import mapLimit from './mapLimit.js'
import range from './internal/range.js'
import wrapAsync from './internal/wrapAsync.js'

/**
 * The same as [times]{@link module:ControlFlow.times} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name timesLimit
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.times]{@link module:ControlFlow.times}
 * @category Control Flow
 * @param {number} count - The number of times to run the function.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - The async function to call `n` times.
 * Invoked with the iteration index and a callback: (n, next).
 * @param {Function} callback - see [async.map]{@link module:Collections.map}.
 * @returns {Promise} a promise, if no callback is provided
 * @example
 *
 * // try calling the iteratee 10 times, but no more than 4 at a time
 * async.timesLimit(10, 4, function(n, next) {
 *     setTimeout(function() {
 *         // do some async operation or process
 *         next(null, n);
 *     }, 100);
 * }, function(err, results) {
 *     // results is equal to [0,1,2,3,...]
 * });
 */
export default function timesLimit(count, limit, iteratee, callback) {
    var _iteratee = wrapAsync(iteratee);
    return mapLimit(range(count), limit, _iteratee, callback);
}
