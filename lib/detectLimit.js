'use strict';

import identity from 'lodash/identity';

import createTester from './internal/createTester';
import eachOfLimit from './eachOfLimit';
import findGetResult from './internal/findGetResult';

/**
 * The same as `detect` but runs a maximum of `limit` async operations at a
 * time.
 *
 * @static
 * @memberof async
 * @alias findLimit
 * @category Collection
 * @param {Array|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {Function} iteratee - A truth test to apply to each item in `coll`.
 * The iteratee is passed a `callback(err, truthValue)` which must be called
 * with a boolean argument once it has completed.
 *
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called as soon as any
 * iteratee returns `true`, or after all the `iteratee` functions have finished.
 * Result will be the first item in the array that passes the truth test
 * (iteratee) or the value `undefined` if none passed.
 *
 * Invoked with (err, result).
 * @example
 *
 * // only 2 iterations will be running at any one time
 * async.detectLimit(['file1','file2','file3'], 2, function(filePath, callback) {
 *     fs.access(filePath, function(err) {
 *         callback(null, !err)
 *     });
 * }, function(err, result) {
 *     // result now equals the first file in the list that exists
 * });
 */
export default createTester(eachOfLimit, identity, findGetResult);
