import noop from 'lodash/noop';
import doParallelLimit from './internal/doParallelLimit';

/**
 * The same as [`groupBy`]{@link module:Collections.groupBy} but runs a maximum of `limit` async operations at a time.
 *
 * @name groupByLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.groupBy]{@link module:Collections.groupBy}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {Function} iteratee - A function to apply to each item in `coll`.
 * The iteratee is passed a `callback(err, key)` which must be called once it
 * has completed with an error (which can be `null`) and the `key` to group the
 * value under. Invoked with (value, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. Result is an `Object` whoses
 * properties are arrays of values which returned the corresponding key.
 */
export default doParallelLimit(function(eachFn, coll, iteratee, callback) {
    callback = callback || noop;
    coll = coll || [];
    var result = {};
    // from MDN, handle object having an `hasOwnProperty` prop
    var hasOwnProperty = Object.prototype.hasOwnProperty;

    eachFn(coll, function(val, _, callback) {
        iteratee(val, function(err, key) {
            if (err) return callback(err);

            if (hasOwnProperty.call(result, key)) {
                result[key].push(val);
            } else {
                result[key] = [val];
            }
            callback(null);
        });
    }, function(err) {
        callback(err, result);
    });
});
