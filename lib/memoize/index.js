'use strict';

var identity = require('async.util.identity');
var restParam = require('async.util.restparam');
var setImmediate = require('async.util.setimmediate');

module.exports = function memoize(fn, hasher) {
    var memo = {};
    var queues = {};
    hasher = hasher || identity;
    var memoized = restParam(function memoized(args) {
        var callback = args.pop();
        var key = hasher.apply(null, args);
        if (key in memo) {
            setImmediate(function() {
                callback.apply(null, memo[key]);
            });
        } else if (key in queues) {
            queues[key].push(callback);
        } else {
            queues[key] = [callback];
            fn.apply(null, args.concat([restParam(function(args) {
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
};
