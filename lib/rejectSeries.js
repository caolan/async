import rejectLimit from './rejectLimit';
import doLimit from './internal/doLimit';

/**
 * The same as `reject` but runs only a single async operation at a time.
 *
 * @name rejectSeries
 * @static
 * @memberOf module:async
 * @method
 * @see [async.reject]{@link module:async.reject}
 * @category Collection
 * @param {Array|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - A truth test to apply to each item in `coll`.
 * The `iteratee` is passed a `callback(err, truthValue)`, which must be called
 * with a boolean argument once it has completed. Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Invoked with (err, results).
 */
export default doLimit(rejectLimit, 1);
