import applyEach from './internal/applyEach.js'
import mapSeries from './mapSeries.js'

/**
 * The same as [`applyEach`]{@link module:ControlFlow.applyEach} but runs only a single async operation at a time.
 *
 * @name applyEachSeries
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.applyEach]{@link module:ControlFlow.applyEach}
 * @category Control Flow
 * @param {Array|Iterable|AsyncIterable|Object} fns - A collection of {@link AsyncFunction}s to all
 * call with the same arguments
 * @param {...*} [args] - any number of separate arguments to pass to the
 * function.
 * @returns {AsyncFunction} - A function, that when called, is the result of
 * applying the `args` to the list of functions. It takes no args, other than
 * an optional callback. If no callback is passed, it returns a Promise.
 */
export default applyEach(mapSeries);
