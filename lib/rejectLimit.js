import reject from './internal/reject';
import doParallelLimit from './internal/doParallelLimit';

/**
 * The same as `reject` but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name rejectLimit
 * @static
 * @memberOf module:async
 * @method
 * @see [async.reject]{@link module:async.reject}
 * @category Collection
 * @param {Array|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {Function} iteratee - A truth test to apply to each item in `coll`.
 * The `iteratee` is passed a `callback(err, truthValue)`, which must be called
 * with a boolean argument once it has completed. Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Invoked with (err, results).
 */
export default doParallelLimit(reject);
