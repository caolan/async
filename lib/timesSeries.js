'use strict';

import timesLimit from './timesLimit';
import doLimit from './internal/doLimit';

/**
 * The same as `times` but runs only a single async operation at a time.
 *
 * @name timesSeries
 * @static
 * @memberOf async
 * @see `async.times`
 * @category Control Flow
 * @param {number} n - The number of times to run the function.
 * @param {Function} iteratee - The function to call `n` times. Invoked with the
 * iteration index and a callback (n, next).
 * @param {Function} callback - see [`map`](#map).
 */
export default doLimit(timesLimit, 1);
