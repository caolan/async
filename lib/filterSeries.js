import _filter from './internal/filter.js'
import eachOfSeries from './eachOfSeries.js'
import awaitify from './internal/awaitify.js'

/**
 * The same as [`filter`]{@link module:Collections.filter} but runs only a single async operation at a time.
 *
 * @name filterSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.filter]{@link module:Collections.filter}
 * @alias selectSeries
 * @category Collection
 * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - A truth test to apply to each item in `coll`.
 * The `iteratee` is passed a `callback(err, truthValue)`, which must be called
 * with a boolean argument once it has completed. Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Invoked with (err, results)
 * @returns {Promise} a promise, if no callback provided
 * @example
 *
 * // One item at a time. Results stay in input order.
 * const numbers = [1, 2, 3, 4];
 *
 * function isEven(n, callback) {
 *     setTimeout(() => {
 *         callback(null, n % 2 === 0);
 *     }, 50);
 * }
 *
 * async.filterSeries(numbers, isEven, (err, results) => {
 *     if (err) throw err;
 *     console.log(results);
 *     // [ 2, 4 ]
 * });
 *
 * // Omit the callback and filterSeries returns a Promise.
 * const results = await async.filterSeries(numbers, async (n) => {
 *     return n % 2 === 0;
 * });
 * console.log(results);
 * // [ 2, 4 ]
 */
function filterSeries (coll, iteratee, callback) {
    return _filter(eachOfSeries, coll, iteratee, callback)
}
export default awaitify(filterSeries, 3);
