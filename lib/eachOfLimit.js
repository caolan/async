'use strict';

import _eachOfLimit from './internal/eachOfLimit';

/**
 * The same as `eachOf` but runs a maximum of `limit` async operations at a
 * time.
 *
 * @static
 * @memberof async
 * @alias forEachOfLimit
 * @category Collection
 * @param {Array|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {Function} iteratee - A function to apply to each
 * item in `coll`. The `key` is the item's key, or index in the case of an
 * array. The iteratee is passed a `callback(err)` which must be called once it
 * has completed. If no error has occurred, the callback should be run without
 * arguments or with an explicit `null` argument.
 *
 * Invoked with (item, key, callback).
 * @param {Function} [callback] - A callback which is called when all
 * `iteratee` functions have finished, or an error occurs.
 *
 * Invoked with (err).
 * @example
 *
 * var obj = {dev: "/dev.json", test: "/test.json", prod: "/prod.json"};
 * var configs = {};
 *
 * // only 2 files will be open at any one time
 * async.forEachOfLimit(obj, 2, function (value, key, callback) {
 *     fs.readFile(__dirname + value, "utf8", function (err, data) {
 *         if (err) return callback(err);
 *         try {
 *             configs[key] = JSON.parse(data);
 *         } catch (e) {
 *             return callback(e);
 *         }
 *         callback();
 *     });
 *}, function (err) {
 *     if (err) console.error(err.message);
 *     // configs is now a map of JSON data
 *     doSomethingWith(configs);
 * })
 */
export default function eachOfLimit(obj, limit, iteratee, cb) {
    _eachOfLimit(limit)(obj, iteratee, cb);
}
