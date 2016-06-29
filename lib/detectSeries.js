import identity from 'lodash/identity';

import createTester from './internal/createTester';
import eachOfSeries from './eachOfSeries';
import findGetResult from './internal/findGetResult';

/**
 * The same as `detect` but runs only a single async operation at a time.
 *
 * @name detectSeries
 * @static
 * @memberOf module:async
 * @method
 * @see [async.detect]{@link module:async.detect}
 * @alias findSeries
 * @category Collection
 * @param {Array|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - A truth test to apply to each item in `coll`.
 * The iteratee is passed a `callback(err, truthValue)` which must be called
 * with a boolean argument once it has completed. Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called as soon as any
 * iteratee returns `true`, or after all the `iteratee` functions have finished.
 * Result will be the first item in the array that passes the truth test
 * (iteratee) or the value `undefined` if none passed. Invoked with
 * (err, result).
 */
export default createTester(eachOfSeries, identity, findGetResult);
