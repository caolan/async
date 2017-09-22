import isArray from 'lodash/isArray';
import noop from 'lodash/noop';
import once from './internal/once';
import eachOf from './eachOf';
import _priorityRace from './internal/priorityRace';

/**
 * @name priorityRace
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Array|Iterable|Object} tasks - A collection of
 * [async functions]{@link AsyncFunction} to run.
 * Each async function can complete with any number of optional `result` values.
 * Each task is non-prioritized by default but can be prioritized by setting
 * `isPrioritized = true`.
 * @param {Function} [callback] - An optional callback to run once all the prioritized
 * functions have completed successfully. This function gets a results array
 * (or object) containing all the result arguments passed to the task callbacks.
 * Invoked with (err, results).
 * @returns undefined
 *
 * @example
 * var tasks = [
 *     function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'one');
 *         }, 100);
 *     },
 *     function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'two');
 *         }, 200);
 *     },
 *     function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'three');
 *         }, 300);
 *     }
 * ]
 *
 * tasks[1].isPrioritized = true;
 *
 * async.priorityRace(tasks,
 * function(err, results) {
 *     // the results array will equal ['one','two'] because the race ended as soon
 *     // as all the prioritzed tasks finished.
 * });
 *
 */
export default function priorityRace(tasks, callback) {
    callback = once(callback || noop);
    if (!isArray(tasks)) return callback(new TypeError('First argument to race must be an array of functions'));
    if (!tasks.length) return callback();
    _priorityRace(eachOf, tasks, callback);
}
