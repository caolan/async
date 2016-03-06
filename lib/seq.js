'use strict';

import noop from 'lodash/noop';
import rest from 'lodash/rest';
import reduce from './reduce';

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
