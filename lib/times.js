'use strict';

import timesLimit from './timesLimit';
import doLimit from './internal/doLimit';

/**
 * Calls the `iteratee` function `n` times, and accumulates results in the same
 * manner you would use with [`map`](#map).
 *
 * @name times
 * @static
 * @memberOf async
 * @see `async.map`
 * @category Control Flow
 * @param {number} n - The number of times to run the function.
 * @param {Function} iteratee - The function to call `n` times. Invoked with the
 * iteration index and a callback (n, next).
 * @param {Function} callback - see [`map`](#map).
 * @example
 *
 * // Pretend this is some complicated async factory
 * var createUser = function(id, callback) {
 *     callback(null, {
 *         id: 'user' + id
 *     });
 * };
 *
 * // generate 5 users
 * async.times(5, function(n, next) {
 *     createUser(n, function(err, user) {
 *         next(err, user);
 *     });
 * }, function(err, users) {
 *     // we should now have 5 users
 * });
 */
export default doLimit(timesLimit, Infinity);
