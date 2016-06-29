import mapLimit from './mapLimit';
import range from 'lodash/_baseRange';

/**
 * ```
 * import timesLimit from 'async/timesLimit'
 * ```
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
 * @param {Function} iteratee - The function to call `n` times. Invoked with the
 * iteration index and a callback (n, next).
 * @param {Function} callback - see [async.map]{@link module:Collections.map}.
 */
export default function timeLimit(count, limit, iteratee, callback) {
    mapLimit(range(0, count, 1), limit, iteratee, callback);
}
