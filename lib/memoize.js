'use strict';

import identity from 'lodash/identity';
import rest from 'lodash/rest';
import has from 'lodash/has';

import setImmediate from './internal/setImmediate';

export default function memoize(fn, hasher) {
    var memo = Object.create(null);
    var queues = Object.create(null);
    hasher = hasher || identity;
    var memoized = rest(function memoized(args) {
        var callback = args.pop();
        var key = hasher.apply(null, args);
        if (has(memo, key)) {
            setImmediate(function() {
                callback.apply(null, memo[key]);
            });
        } else if (has(queues, key)) {
            queues[key].push(callback);
        } else {
            queues[key] = [callback];
            fn.apply(null, args.concat([rest(function(args) {
                memo[key] = args;
                var q = queues[key];
                delete queues[key];
                for (var i = 0, l = q.length; i < l; i++) {
                    q[i].apply(null, args);
                }
            })]));
        }
    });
    memoized.memo = memo;
    memoized.unmemoized = fn;
    return memoized;
}
