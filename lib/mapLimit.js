'use strict';

import doParallelLimit from './internal/doParallelLimit';
import map from './internal/map';

/**
 * The same as `map` but runs a maximum of `limit` async operations at a time.
 *
 * @static
 * @memberof async
 * @category Collection
 * @param {Array|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {Function} iteratee - A function to apply to each item in `coll`.
 * The iteratee is passed a `callback(err, transformed)` which must be called
 * once it has completed with an error (which can be `null`) and a
 * transformed item.
 *
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. Results is an array of the
 * transformed items from the `coll`.
 *
 * Invoked with (err, results).
 * @example
 *
 * // only 2 iterations will be running at any one time
 * async.mapLimit(['file1','file2','file3'], 2, fs.stat, function(err, results) {
 *     // results is now an array of stats for each file
 * });
 */
export default doParallelLimit(map);
