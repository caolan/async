'use strict';

import noop from 'lodash/noop';
import rest from 'lodash/rest';
import reduce from './reduce';

/**
 * Version of the compose function that is more natural to read. Each function
 * consumes the return value of the previous function. It is the equivalent of
 * [`compose`](#compose) with the arguments reversed.
 *
 * Each function is executed with the `this` binding of the composed function.
 *
 * @name seq
 * @static
 * @memberOf async
 * @see `async.compose`
 * @category Control Flow
 * @param {...Function} functions - the asynchronous functions to compose
 * @example
 *
 * // Requires lodash (or underscore), express3 and dresende's orm2.
 * // Part of an app, that fetches cats of the logged user.
 * // This example uses `seq` function to avoid overnesting and error
 * // handling clutter.
 * app.get('/cats', function(request, response) {
 *     var User = request.models.User;
 *     async.seq(
 *         _.bind(User.get, User),  // 'User.get' has signature (id, callback(err, data))
 *         function(user, fn) {
 *             user.getCats(fn);      // 'getCats' has signature (callback(err, data))
 *         }
 *     )(req.session.user_id, function (err, cats) {
 *         if (err) {
 *             console.error(err);
 *             response.json({ status: 'error', message: err.message });
 *         } else {
 *             response.json({ status: 'ok', message: 'Cats found', data: cats });
 *         }
 *     });
 * });
 */
export default function seq( /* functions... */ ) {
    var fns = arguments;
    return rest(function(args) {
        var that = this;

        var cb = args[args.length - 1];
        if (typeof cb == 'function') {
            args.pop();
        } else {
            cb = noop;
        }

        reduce(fns, args, function(newargs, fn, cb) {
                fn.apply(that, newargs.concat([rest(function(err, nextargs) {
                    cb(err, nextargs);
                })]));
            },
            function(err, results) {
                cb.apply(that, [err].concat(results));
            });
    });
}
