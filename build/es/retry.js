'use strict';

import series from './series';

export default function retry(times, task, callback) {
    var DEFAULT_TIMES = 5;
    var DEFAULT_INTERVAL = 0;

    var attempts = [];

    var opts = {
        times: DEFAULT_TIMES,
        interval: DEFAULT_INTERVAL
    };

    function parseTimes(acc, t) {
        if (typeof t === 'number') {
            acc.times = parseInt(t, 10) || DEFAULT_TIMES;
        } else if (typeof t === 'object') {
            acc.times = parseInt(t.times, 10) || DEFAULT_TIMES;
            acc.interval = parseInt(t.interval, 10) || DEFAULT_INTERVAL;
        } else {
            throw new Error('Unsupported argument type for \'times\': ' + typeof t);
        }
    }

    var length = arguments.length;
    if (length < 1 || length > 3) {
        throw new Error('Invalid arguments - must be either (task), (task, callback), (times, task) or (times, task, callback)');
    } else if (length <= 2 && typeof times === 'function') {
        callback = task;
        task = times;
    }
    if (typeof times !== 'function') {
        parseTimes(opts, times);
    }
    opts.callback = callback;
    opts.task = task;

    function wrappedTask(wrappedCallback, wrappedResults) {
        function retryAttempt(task, finalAttempt) {
            return function(seriesCallback) {
                task(function(err, result) {
                    seriesCallback(!err || finalAttempt, {
                        err: err,
                        result: result
                    });
                }, wrappedResults);
            };
        }

        function retryInterval(interval) {
            return function(seriesCallback) {
                setTimeout(function() {
                    seriesCallback(null);
                }, interval);
            };
        }

        while (opts.times) {

            var finalAttempt = !(opts.times -= 1);
            attempts.push(retryAttempt(opts.task, finalAttempt));
            if (!finalAttempt && opts.interval > 0) {
                attempts.push(retryInterval(opts.interval));
            }
        }

        series(attempts, function(done, data) {
            data = data[data.length - 1];
            (wrappedCallback || opts.callback)(data.err, data.result);
        });
    }

    // If a callback is passed, run this as a controll flow
    return opts.callback ? wrappedTask() : wrappedTask;
}
