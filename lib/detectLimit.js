import createTester from './internal/createTester.js'
import eachOfLimit from './internal/eachOfLimit.js'
import awaitify from './internal/awaitify.js'

/**
 * The same as [`detect`]{@link module:Collections.detect} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name detectLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.detect]{@link module:Collections.detect}
 * @alias findLimit
 * @category Collections
 * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - A truth test to apply to each item in `coll`.
 * The iteratee must complete with a boolean value as its result.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called as soon as any
 * iteratee returns `true`, or after all the `iteratee` functions have finished.
 * Result will be the first item in the array that passes the truth test
 * (iteratee) or the value `undefined` if none passed. Invoked with
 * (err, result).
 * @returns {Promise} a promise, if a callback is omitted
 * @example
 *
 * // dir1 is a directory that contains file1.txt, file2.txt
 * // dir2 is a directory that contains file3.txt, file4.txt
 * // dir3 is a directory that contains file5.txt
 *
 * // asynchronous function that checks if a file exists
 * function fileExists(file, callback) {
 *    fs.access(file, fs.constants.F_OK, (err) => {
 *        callback(null, !err);
 *    });
 * }
 *
 * async.detectLimit(['file3.txt','file2.txt','dir1/file1.txt'], 2, fileExists,
 *    function(err, result) {
 *        console.log(result);
 *        // dir1/file1.txt
 *        // result now equals the first file in the list that exists
 *    }
 * );
 *
 * // Using Promises
 * async.detectLimit(['file3.txt','file2.txt','dir1/file1.txt'], 2, fileExists)
 * .then(result => {
 *     console.log(result);
 *     // dir1/file1.txt
 *     // result now equals the first file in the list that exists
 * }).catch(err => {
 *     console.log(err);
 * });
 *
 * // Using async/await
 * async () => {
 *     try {
 *         let result = await async.detectLimit(['file3.txt','file2.txt','dir1/file1.txt'], 2, fileExists);
 *         console.log(result);
 *         // dir1/file1.txt
 *         // result now equals the first file in the list that exists
 *     }
 *     catch (err) {
 *         console.log(err);
 *     }
 * }
 *
 */
function detectLimit(coll, limit, iteratee, callback) {
    return createTester(bool => bool, (res, item) => item)(eachOfLimit(limit), coll, iteratee, callback)
}
export default awaitify(detectLimit, 4)
