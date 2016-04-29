'use strict';

import whilst from './whilst';

/**
 * The post-check version of {@link async.whilst}. To reflect the difference in
 * the order of operations, the arguments `test` and `fn` are switched.
 *
 * `doWhilst` is to `whilst` as `do while` is to `while` in plain JavaScript.
 *
 * @name doWhilst
 * @static
 * @memberOf async
 * @see async.whilst
 * @category Control Flow
 * @param {Function} fn - A function which is called each time `test` passes.
 * The function is passed a `callback(err)`, which must be called once it has
 * completed with an optional `err` argument. Invoked with (callback).
 * @param {Function} test - synchronous truth test to perform before each
 * execution of `fn`. Invoked with ().
 * @param {Function} [callback] - A callback which is called after the test
 * function has failed and repeated execution of `fn` has stopped. `callback`
 * will be passed an error and any arguments passed to the final `fn`'s
 * callback. Invoked with (err, [results]);
 */
export default function doWhilst(iteratee, test, cb) {
    var calls = 0;
    return whilst(function() {
        return ++calls <= 1 || test.apply(this, arguments);
    }, iteratee, cb);
}
