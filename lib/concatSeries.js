import concatLimit from './concatLimit.js'
import awaitify from './internal/awaitify.js'

/**
 * The same as [`concat`]{@link module:Collections.concat} but runs only a single async operation at a time.
 *
 * @name concatSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.concat]{@link module:Collections.concat}
 * @category Collection
 * @alias flatMapSeries
 * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - A function to apply to each item in `coll`.
 * The iteratee should complete with an array an array of results.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished, or an error occurs. Results is an array
 * containing the concatenated results of the `iteratee` function. Invoked with
 * (err, results).
 * @returns A Promise, if no callback is passed
 * @example
 *
 * // One item at a time. Iteratee arrays are concatenated, in input order.
 * const words = ["hello", "world", "async"];
 *
 * function chars(word, callback) {
 *     setTimeout(() => {
 *         callback(null, [...word]);
 *     }, 100);
 * }
 *
 * async.concatSeries(words, chars, (err, results) => {
 *     if (err) throw err;
 *     console.log(results);
 *     // ["h","e","l","l","o","w","o","r","l","d","a","s","y"]
 * });
 *
 * // Omit the callback and concatSeries returns a Promise.
 * const results = await async.concatSeries(words, async (word) => [...word]);
 * console.log(results);
 * // ["h","e","l","l","o","w","o","r","l","d","a","s","y"]
 */
function concatSeries(coll, iteratee, callback) {
    return concatLimit(coll, 1, iteratee, callback)
}
export default awaitify(concatSeries, 3);
