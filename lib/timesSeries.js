import timesLimit from './timesLimit';
import doLimit from './internal/doLimit';

/**
 * The same as {@link async.times} but runs only a single async operation at a time.
 *
 * @name timesSeries
 * @static
 * @memberOf module:async
 * @method
 * @see [async.times]{@link module:async.times}
 * @category Control Flow
 * @param {number} n - The number of times to run the function.
 * @param {Function} iteratee - The function to call `n` times. Invoked with the
 * iteration index and a callback (n, next).
 * @param {Function} callback - see {@link async.map}.
 */
export default doLimit(timesLimit, 1);
