'use strict';

import eachOfLimit from './internal/eachOfLimit';
import withoutIndex from './internal/withoutIndex';

/**
 * The same as `each` but runs a maximum of `limit` async operations at a time.
 *
 * @static
 * @memberof async
 * @alias forEachLimit
 * @category Collection
 * @param {Array|Object} coll - A colleciton to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {Function} iteratee(item, callback) - A function to apply to each item
 * in `coll`. The iteratee is passed a `callback(err)` which must be called once
 * it has completed. If no error has occurred, the `callback` should be run
 * without arguments or with an explicit `null` argument. The array index is not
 * passed to the iteratee.
 *
 * Invoked with (item, callback). If you need the index, use `eachOfLimit`.
 * @param {Function} [callback] - A callback which is called when all
 * `iteratee` functions have finished, or an error occurs.
 *
 * Invoked with (err).
 * @example
 *
 * // assuming openFiles is an array of file names
 * // only 2 iterations will be running at any one time
 * async.eachLimit(openFiles, 2, function(file, callback) {
 *   // perform operaitons on file here
 *   console.log('Processing file ' + file);
 *
 *   // when done call `callback`
 *   callback();
 * }, function(err) {
 *   // if any of the file processing produced an error, err would equal that error
 *   if( err ) {
 *     // One of the iterations produced an error.
 *     // All processing will now stop.
 *     console.log('A file failed to process');
 *   } else {
 *     console.log('All files have been processed successfully');
 *   }
 * });
 */
export default function eachLimit(arr, limit, iteratee, cb) {
    return eachOfLimit(limit)(arr, withoutIndex(iteratee), cb);
}
