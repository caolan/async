import doWhilst from './doWhilst.js'
import wrapAsync from './internal/wrapAsync.js'

/**
 * Like ['doWhilst']{@link module:ControlFlow.doWhilst}, except the `test` is inverted. Note the
 * argument ordering differs from `until`.
 *
 * @name doUntil
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.doWhilst]{@link module:ControlFlow.doWhilst}
 * @category Control Flow
 * @param {AsyncFunction} iteratee - An async function which is called each time
 * `test` fails. Invoked with (callback).
 * @param {AsyncFunction} test - asynchronous truth test to perform after each
 * execution of `iteratee`. Invoked with (...args, callback), where `...args` are the
 * non-error args from the previous callback of `iteratee`
 * @param {Function} [callback] - A callback which is called after the test
 * function has passed and repeated execution of `iteratee` has stopped. `callback`
 * will be passed an error and any arguments passed to the final `iteratee`'s
 * callback. Invoked with (err, [results]);
 * @returns {Promise} a promise, if no callback is passed
 */
export default function doUntil(iteratee, test, callback) {
    const _test = wrapAsync(test)
    return doWhilst(iteratee, (...args) => {
        const cb = args.pop()
        _test(...args, (err, truth) => cb (err, !truth))
    }, callback);
}
