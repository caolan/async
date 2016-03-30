'use strict';

import mapLimit from './mapLimit';
import doLimit from './internal/doLimit';

/**
 * The same as `map` but runs only a single async operation at a time.
 *
 * @name mapSeries
 * @static
 * @memberOf async
 * @see async.map
 * @category Collection
 * @param {Array|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - A function to apply to each item in `coll`.
 * The iteratee is passed a `callback(err, transformed)` which must be called
 * once it has completed with an error (which can be `null`) and a
 * transformed item. Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. Results is an array of the
 * transformed items from the `coll`. Invoked with (err, results).
 */
export default doLimit(mapLimit, 1);
