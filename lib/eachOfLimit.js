'use strict';

import _eachOfLimit from './internal/eachOfLimit';

/**
 * The same as `eachOf` but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name eachOfLimit
 * @static
 * @memberOf async
 * @see `async.eachOf`
 * @alias forEachOfLimit
 * @category Collection
 * @param {Array|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {Function} iteratee - A function to apply to each
 * item in `coll`. The `key` is the item's key, or index in the case of an
 * array. The iteratee is passed a `callback(err)` which must be called once it
 * has completed. If no error has occurred, the callback should be run without
 * arguments or with an explicit `null` argument. Invoked with
 * (item, key, callback).
 * @param {Function} [callback] - A callback which is called when all
 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
 */
export default function eachOfLimit(obj, limit, iteratee, cb) {
    _eachOfLimit(limit)(obj, iteratee, cb);
}
