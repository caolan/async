'use strict';

import someLimit from './someLimit';
import doLimit from './internal/doLimit';

/**
 * The same as `some` but runs only a single async operation at a time.
 *
 * @static
 * @memberof async
 * @alias anySeries
 * @category Collection
 * @param {Array|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - A truth test to apply to each item in the array
 * in parallel. The iteratee is passed a `callback(err, truthValue)` which must
 * be called with a boolean argument once it has completed.
 *
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called as soon as any
 * iteratee returns `true`, or after all the iteratee functions have finished.
 * Result will be either `true` or `false` depending on the values of the async
 * tests.
 *
 * Invoked with (err, result).
 * @example
 *
 * // the files will be iterated one at a time
 * async.someSeries(['file1','file2','file3'], function(filePath, callback) {
 *     fs.access(filePath, function(err) {
 *         callback(null, !err)
 *     });
 * }, function(err, result) {
 *     // if result is true then at least one of the files exists
 * });
 */
export default doLimit(someLimit, 1);
