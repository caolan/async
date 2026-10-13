import applyEach from './internal/applyEach.js'
import map from './map.js'

/**
 * Returns a function that applies the provided arguments to each function in
 * `fns`. Pass a callback to the returned function to receive the results as an
 * array after all functions have completed. Calling the returned function
 * without a callback returns a Promise for the results.
 *
 * @name applyEach
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Array|Iterable|AsyncIterable|Object} fns - A collection of {@link AsyncFunction}s
 * to all call with the same arguments
 * @param {...*} [args] - any number of separate arguments to pass to the
 * function.
 * @returns {AsyncFunction} - Returns a function that takes no args other than
 * an optional callback. If no callback is passed, it returns a Promise.
 * @example
 *
 * const appliedFn = async.applyEach([enableSearch, updateSchema], 'bucket')
 *
 * appliedFn((err, results) => {
 *     // results[0] is the results for `enableSearch`
 *     // results[1] is the results for `updateSchema`
 * });
 *
 * // or use a Promise:
 * appliedFn().then(results => {
 *     console.log(results);
 * });
 *
 * // apply the same functions to each bucket:
 * async.each(
 *     buckets,
 *     async (bucket) => async.applyEach([enableSearch, updateSchema], bucket)(),
 *     callback
 * );
 */
export default applyEach(map);
