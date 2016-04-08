'use strict';

import applyEach from './internal/applyEach';
import mapSeries from './mapSeries';

/**
 * The same as `applyEach` but runs only a single async operation at a time.
 *
 * @name applyEachSeries
 * @static
 * @memberOf async
 * @see `async.applyEach`
 * @category Control Flow
 * @param {Array|Object} fns - A collection of asynchronous functions to all
 * call with the same arguments
 * @param {...*} [args] - any number of separate arguments to pass to the
 * function.
 * @param {Function} [callback] - the final argument should be the callback,
 * called when all functions have completed processing.
 * @returns {Function} - If only the first argument is provided, it will return
 * a function which lets you pass in the arguments as if it were a single
 * function call.
 */
export default applyEach(mapSeries);
