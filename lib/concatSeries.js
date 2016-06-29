import concat from './internal/concat';
import doSeries from './internal/doSeries';

/**
 * The same as `concat` but runs only a single async operation at a time.
 *
 * @name concatSeries
 * @static
 * @memberOf module:async
 * @method
 * @see [async.concat]{@link module:async.queue}
 * @category Collection
 * @param {Array|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - A function to apply to each item in `coll`.
 * The iteratee is passed a `callback(err, results)` which must be called once
 * it has completed with an error (which can be `null`) and an array of results.
 * Invoked with (item, callback).
 * @param {Function} [callback(err)] - A callback which is called after all the
 * `iteratee` functions have finished, or an error occurs. Results is an array
 * containing the concatenated results of the `iteratee` function. Invoked with
 * (err, results).
 */
export default doSeries(concat);
