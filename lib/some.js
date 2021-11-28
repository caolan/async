import createTester from './internal/createTester.js'
import eachOf from './eachOf.js'
import awaitify from './internal/awaitify.js'

/**
 * Returns `true` if at least one element in the `coll` satisfies an async test.
 * If any iteratee call returns `true`, the main `callback` is immediately
 * called.
 *
 * @name some
 * @static
 * @memberOf module:Collections
 * @method
 * @alias any
 * @category Collection
 * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async truth test to apply to each item
 * in the collections in parallel.
 * The iteratee should complete with a boolean `result` value.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called as soon as any
 * iteratee returns `true`, or after all the iteratee functions have finished.
 * Result will be either `true` or `false` depending on the values of the async
 * tests. Invoked with (err, result).
 * @returns {Promise} a promise, if no callback provided
 * @example
 *
 * // dir1 is a directory that contains file1.txt, file2.txt
 * // dir2 is a directory that contains file3.txt, file4.txt
 * // dir3 is a directory that contains file5.txt
 * // dir4 does not exist
 *
 * // asynchronous function that checks if a file exists
 * function fileExists(file, callback) {
 *    fs.access(file, fs.constants.F_OK, (err) => {
 *        callback(null, !err);
 *    });
 * }
 *
 * // Using callbacks
 * async.some(['dir1/missing.txt','dir2/missing.txt','dir3/file5.txt'], fileExists,
 *    function(err, result) {
 *        console.log(result);
 *        // true
 *        // result is true since some file in the list exists
 *    }
 *);
 *
 * async.some(['dir1/missing.txt','dir2/missing.txt','dir4/missing.txt'], fileExists,
 *    function(err, result) {
 *        console.log(result);
 *        // false
 *        // result is false since none of the files exists
 *    }
 *);
 *
 * // Using Promises
 * async.some(['dir1/missing.txt','dir2/missing.txt','dir3/file5.txt'], fileExists)
 * .then( result => {
 *     console.log(result);
 *     // true
 *     // result is true since some file in the list exists
 * }).catch( err => {
 *     console.log(err);
 * });
 *
 * async.some(['dir1/missing.txt','dir2/missing.txt','dir4/missing.txt'], fileExists)
 * .then( result => {
 *     console.log(result);
 *     // false
 *     // result is false since none of the files exists
 * }).catch( err => {
 *     console.log(err);
 * });
 *
 * // Using async/await
 * async () => {
 *     try {
 *         let result = await async.some(['dir1/missing.txt','dir2/missing.txt','dir3/file5.txt'], fileExists);
 *         console.log(result);
 *         // true
 *         // result is true since some file in the list exists
 *     }
 *     catch (err) {
 *         console.log(err);
 *     }
 * }
 *
 * async () => {
 *     try {
 *         let result = await async.some(['dir1/missing.txt','dir2/missing.txt','dir4/missing.txt'], fileExists);
 *         console.log(result);
 *         // false
 *         // result is false since none of the files exists
 *     }
 *     catch (err) {
 *         console.log(err);
 *     }
 * }
 *
 */
function some(coll, iteratee, callback) {
    return createTester(Boolean, res => res)(eachOf, coll, iteratee, callback)
}
export default awaitify(some, 3);
