'use strict';

import mapLimit from './mapLimit';
import range from 'lodash/_baseRange';

/**
* The same as `times` but runs a maximum of `limit` async operations at a
* time.
 *
 * @name timesLimit
 * @static
 * @memberOf async
 * @see `async.times`
 * @category Control Flow
 * @param {number} n - The number of times to run the function.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {Function} iteratee - The function to call `n` times. Invoked with the
 * iteration index and a callback (n, next).
 * @param {Function} callback - see [`map`](#map).
 */
export default function timeLimit(count, limit, iteratee, cb) {
    return mapLimit(range(0, count, 1), limit, iteratee, cb);
}
