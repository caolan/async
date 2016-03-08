'use strict';

import series from './series';
import noop from 'lodash/noop';

export default function retry(times, task, callback) {
    var DEFAULT_TIMES = 5;
    var DEFAULT_INTERVAL = 0;


    var opts = {
        times: DEFAULT_TIMES,
        interval: DEFAULT_INTERVAL
    };

    function parseTimes(acc, t) {
        if (typeof t === 'object') {
            acc.times = +t.times || DEFAULT_TIMES;
            acc.interval = +t.interval || DEFAULT_INTERVAL;
        } else if (typeof t === 'number' || typeof t === 'string') {
            acc.times = +t || DEFAULT_TIMES;
        } else {
            throw new Error("Invalid arguments for async.retry");
        }
    }


    if (arguments.length < 3 && typeof times === 'function') {
        callback = task || noop;
        task = times;
    } else {
        parseTimes(opts, times);
        callback = callback || noop;
    }


    if (typeof task !== 'function') {
        throw new Error("Invalid arguments for async.retry");
    }


    var attempts = [];
    while (opts.times) {
        var isFinalAttempt = !(opts.times -= 1);
        attempts.push(retryAttempt(isFinalAttempt));
        if (!isFinalAttempt && opts.interval > 0) {
            attempts.push(retryInterval(opts.interval));
        }
    }

    series(attempts, function(done, data) {
        data = data[data.length - 1];
        callback(data.err, data.result);
    });


    function retryAttempt(isFinalAttempt) {
        return function(seriesCallback) {
            task(function(err, result) {
                seriesCallback(!err || isFinalAttempt, {
                    err: err,
                    result: result
                });
            });
        };
    }

    function retryInterval(interval) {
        return function(seriesCallback) {
            setTimeout(function() {
                seriesCallback(null);
            }, interval);
        };
    }
}
