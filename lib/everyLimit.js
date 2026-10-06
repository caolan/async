import createTester from './internal/createTester.js'
import eachOfLimit from './internal/eachOfLimit.js'
import awaitify from './internal/awaitify.js'

/**
 * The same as [`every`]{@link module:Collections.every} but runs a maximum of `limit` async operations at a time.
 *
 * @name everyLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.every]{@link module:Collections.every}
 * @alias allLimit
 * @category Collection
 * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - An async truth test to apply to each item
 * in the collection in parallel.
 * The iteratee must complete with a boolean result value.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Result will be either `true` or `false`
 * depending on the values of the async tests. Invoked with (err, result).
 * @returns {Promise} a promise, if no callback provided
 * @example
 *
 * // Check up to two files at a time. Stops early on the first `false`.
 * // dir1 is a directory that contains file1.txt, file2.txt
 * // dir2 is a directory that contains file3.txt, file4.txt
 * const fileList = ['dir1/file1.txt','dir2/file3.txt','dir1/file2.txt'];
 *
 * // asynchronous function that checks if a file exists
 * function fileExists(file, callback) {
 *     fs.access(file, fs.constants.F_OK, (err) => {
 *         callback(null, !err);
 *     });
 * }
 *
 * async.everyLimit(fileList, 2, fileExists, (err, result) => {
 *     if (err) throw err;
 *     console.log(result);
 *     // true
 *     // result is true since every file exists
 * });
 *
 * // Omit the callback and everyLimit returns a Promise.
 * const allExist = await async.everyLimit(fileList, 2, async (file) => {
 *     return fs.promises.access(file).then(() => true, () => false);
 * });
 * console.log(allExist);
 * // true
 */
function everyLimit(coll, limit, iteratee, callback) {
    return createTester(bool => !bool, res => !res)(eachOfLimit(limit), coll, iteratee, callback)
}
export default awaitify(everyLimit, 4);
