/**
 * Calls the provided function if the conditional is truthy. A callback is given
 * which takes an error, optional return value, and the value of the conditional argument.
 *
 * @name callIf
 * @static
 * @memberOf async
 * @category Control Flow
 * @param {Function} fn - An asynchronous function to conditionally call
 * @param {Function|Boolean} cond - A boolean condition or function which returns a boolean
 * whose value determines whether fn should be called
 * @param {Function} [callback] - the final argument should be the callback,
 * called after fn has completed executing or after cond evaluates to false.
 * callback accepts an err value, the return value of fn (undefined if fn is not called) and the
 * value of the conditional, cond
 *
 * @example
 *
 * async.callIf(sendAlert, err, callback);
 *
 */
export default function callIf(fn, cond, callback) {
    var shouldCallFn;
    if (typeof cond === 'function') {
        shouldCallFn = cond();
    } else {
        shouldCallFn = cond;
    }
    if (shouldCallFn) {
        fn((err, returnVal) => {
            callback(err, returnVal, cond);
        });
    } else {
        callback(null, null, cond);
    }
};
