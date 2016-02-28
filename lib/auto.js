'use strict';

import arrayEach from 'lodash/_arrayEach';
import arrayEvery from 'lodash/_arrayEvery';
import baseHas from 'lodash/_baseHas';
import forOwn from 'lodash/forOwn';
import indexOf from 'lodash/indexOf';
import isArray from 'lodash/isArray';
import okeys from 'lodash/keys';
import noop from 'lodash/noop';
import once from 'lodash/once';
import rest from 'lodash/rest';

import setImmediate from './internal/setImmediate';

export default function (tasks, concurrency, callback) {
    if (typeof arguments[1] === 'function') {
        // concurrency is optional, shift the args.
        callback = concurrency;
        concurrency = null;
    }
    callback = once(callback || noop);
    var keys = okeys(tasks);
    var remainingTasks = keys.length;
    if (!remainingTasks) {
        return callback(null);
    }
    if (!concurrency) {
        concurrency = remainingTasks;
    }

    var results = {};
    var runningTasks = 0;
    var hasError = false;

    var listeners = [];

    function addListener(fn) {
        listeners.unshift(fn);
    }

    function removeListener(fn) {
        var idx = indexOf(listeners, fn);
        if (idx >= 0) listeners.splice(idx, 1);
    }

    function taskComplete() {
        remainingTasks--;
        arrayEach(listeners.slice(), function (fn) {
            fn();
        });
    }

    addListener(function () {
        if (!remainingTasks) {
            callback(null, results);
        }
    });

    arrayEach(keys, function (k) {
        if (hasError) return;
        var task = isArray(tasks[k]) ? tasks[k]: [tasks[k]];
        var taskCallback = rest(function(err, args) {
            runningTasks--;
            if (args.length <= 1) {
                args = args[0];
            }
            if (err) {
                var safeResults = {};
                forOwn(results, function(val, rkey) {
                    safeResults[rkey] = val;
                });
                safeResults[k] = args;
                hasError = true;
                listeners = [];

                callback(err, safeResults);
            }
            else {
                results[k] = args;
                setImmediate(taskComplete);
            }
        });

        var requires = task.slice(0, task.length - 1);

        checkForDeadlocks();

        if (ready()) {
            startNext();
        } else {
            addListener(listener);
        }

        function checkForDeadlocks() {
            var len = requires.length;
            var dep;
            while (len--) {
                if (!(dep = tasks[requires[len]])) {
                    throw new Error('Has non-existent dependency in ' +
                        requires.join(', '));
                }
                if (isArray(dep) && indexOf(dep, k) >= 0) {
                    throw new Error('Has cyclic dependencies');
                }
            }
        }

        function ready() {
            return runningTasks < concurrency &&
                !baseHas(results, k) &&
                !hasError &&
                arrayEvery(requires, function (x) {
                    return baseHas(results, x);
                });
        }

        function startNext() {
            runningTasks++;
            var taskFn = task[task.length - 1];
            if (requires.length > 0) {
                taskFn(results, taskCallback);
            } else {
                taskFn(taskCallback);
            }
        }

        function listener() {
            if (ready()) {
                removeListener(listener);
                startNext();
            }
        }
    });
}
