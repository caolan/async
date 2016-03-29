'use strict';

import eachLimit from './eachLimit';
import doLimit from './internal/doLimit';

/**
 * The same as `each` but runs only a single async operation at a time.
 *
 * @static
 * @memberof async
 * @category Collection
 * @param {Array|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - A function to apply to each
 * item in `coll`. The iteratee is passed a `callback(err)` which must be called
 * once it has completed. If no error has occurred, the `callback` should be run
 *  without arguments or with an explicit `null` argument. The array index is
 * not passed to the iteratee.
 *
 * Invoked with (item, callback). If you need the index, use `eachOfSeries`.
 * @param {Function} [callback] - A callback which is called when all
 * `iteratee` functions have finished, or an error occurs.
 *
 * Invoked with (err).
 * @example
 *
 * // assuming openFiles is an array of file names
 * // the files will be iterated one at a time
 * async.eachSeries(openFiles, function(file, callback) {
 *   // perform operaitons on file here
 *   console.log('Processing file ' + file);
 *
 *   // when done call `callback`, and the next iteration will be invoked
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
export default doLimit(eachLimit, 1);
