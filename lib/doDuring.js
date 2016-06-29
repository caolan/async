import during from './during';

/**
 * The post-check version of {@link async.during}. To reflect the difference in
 * the order of operations, the arguments `test` and `fn` are switched.
 *
 * Also a version of {@link async.doWhilst} with asynchronous `test` function.
 * @name doDuring
 * @static
 * @memberOf module:async
 * @method
 * @see [async.during]{@link module:async.during}
 * @category Control Flow
 * @param {Function} fn - A function which is called each time `test` passes.
 * The function is passed a `callback(err)`, which must be called once it has
 * completed with an optional `err` argument. Invoked with (callback).
 * @param {Function} test - asynchronous truth test to perform before each
 * execution of `fn`. Invoked with (callback).
 * @param {Function} [callback] - A callback which is called after the test
 * function has failed and repeated execution of `fn` has stopped. `callback`
 * will be passed an error and any arguments passed to the final `fn`'s
 * callback. Invoked with (err, [results]);
 */
export default function doDuring(fn, test, callback) {
    var calls = 0;

    during(function(next) {
        if (calls++ < 1) return next(null, true);
        test.apply(this, arguments);
    }, fn, callback);
}
