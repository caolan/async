import createTester from './internal/createTester.js'
import eachOf from './eachOf.js'
import awaitify from './internal/awaitify.js'

/**
 * Returns `true` if every element in `coll` satisfies an async test. If any
 * iteratee call returns `false`, the main `callback` is immediately called.
 *
 * @name every
 * @static
 * @memberOf module:Collections
 * @method
 * @alias all
 * @category Collection
 * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
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
 * // dir1 is a directory that contains file1.txt, file2.txt
 * // dir2 is a directory that contains file3.txt, file4.txt
 * // dir3 is a directory that contains file5.txt
 * // dir4 does not exist
 *
 * const fileList = ['dir1/file1.txt','dir2/file3.txt','dir3/file5.txt'];
 * const withMissingFileList = ['file1.txt','file2.txt','file4.txt'];
 *
 * // asynchronous function that checks if a file exists
 * function fileExists(file, callback) {
 *    fs.access(file, fs.constants.F_OK, (err) => {
 *        callback(null, !err);
 *    });
 * }
 *
 * // Using callbacks
 * async.every(fileList, fileExists, function(err, result) {
 *     console.log(result);
 *     // true
 *     // result is true since every file exists
 * });
 *
 * async.every(withMissingFileList, fileExists, function(err, result) {
 *     console.log(result);
 *     // false
 *     // result is false since NOT every file exists
 * });
 *
 * // Using Promises
 * async.every(fileList, fileExists)
 * .then( result => {
 *     console.log(result);
 *     // true
 *     // result is true since every file exists
 * }).catch( err => {
 *     console.log(err);
 * });
 *
 * async.every(withMissingFileList, fileExists)
 * .then( result => {
 *     console.log(result);
 *     // false
 *     // result is false since NOT every file exists
 * }).catch( err => {
 *     console.log(err);
 * });
 *
 * // Using async/await
 * async () => {
 *     try {
 *         let result = await async.every(fileList, fileExists);
 *         console.log(result);
 *         // true
 *         // result is true since every file exists
 *     }
 *     catch (err) {
 *         console.log(err);
 *     }
 * }
 *
 * async () => {
 *     try {
 *         let result = await async.every(withMissingFileList, fileExists);
 *         console.log(result);
 *         // false
 *         // result is false since NOT every file exists
 *     }
 *     catch (err) {
 *         console.log(err);
 *     }
 * }
 *
 */
function every(coll, iteratee, callback) {
    return createTester(bool => !bool, res => !res)(eachOf, coll, iteratee, callback)
}
export default awaitify(every, 3);
