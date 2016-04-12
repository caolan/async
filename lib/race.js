'use strict';

import isArray from 'lodash/isArray';
import each from 'lodash/each';
import noop from 'lodash/noop';
import once from './internal/once';

/**
 * Runs the `tasks` array of functions in parallel, without waiting until the
 * previous function has completed. Once any the `tasks` completed or pass an
 * error to its callback, the main `callback` is immediately called. It's
 * equivalent to `Promise.race()`.
 *
 * @name race
 * @static
 * @memberOf async
 * @category Control Flow
 * @param {Array} tasks - An array containing functions to run. Each function
 * is passed a `callback(err, result)` which it must call on completion with an
 * error `err` (which can be `null`) and an optional `result` value.
 * @param {Function} callback - A callback to run once any of the functions have
 * completed. This function gets an error or result from the first function that
 * completed. Invoked with (err, result).
 * @example
 *
 * async.race([
 *     function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'one');
 *         }, 200);
 *     },
 *     function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'two');
 *         }, 100);
 *     }
 * ],
 * // main callback
 * function(err, result) {
 *     // the result will be equal to 'two' as it finishes earlier
 * });
 */
export default function race(tasks, cb) {
    cb = once(cb || noop);
    if (!isArray(tasks)) return cb(new TypeError('First argument to race must be an array of functions'));
    if (!tasks.length) return cb();
    each(tasks, function (task) {
        task(cb);
    });
}
