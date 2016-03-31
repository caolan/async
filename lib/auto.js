'use strict';

import arrayEach from 'lodash/_arrayEach';
import forOwn from 'lodash/forOwn';
import indexOf from 'lodash/_baseIndexOf';
import isArray from 'lodash/isArray';
import okeys from 'lodash/keys';
import noop from 'lodash/noop';
import once from './internal/once';
import rest from 'lodash/rest';

import onlyOnce from './internal/onlyOnce';

export default function (tasks, concurrency, callback) {
    if (typeof concurrency === 'function') {
        // concurrency is optional, shift the args.
        callback = concurrency;
        concurrency = null;
    }
    callback = once(callback || noop);
    var keys = okeys(tasks);
    var numTasks = keys.length;
    if (!numTasks) {
        return callback(null);
    }
    if (!concurrency) {
        concurrency = numTasks;
    }

    var results = {};
    var runningTasks = 0;
    var hasError = false;

    var listeners = {};

    var readyTasks = [];


    forOwn(tasks, function (task, key) {
        if (!isArray(task)) {
            // no dependencies
            enqueueTask(key, [task]);
            return;
        }

        var dependencies = task.slice(0, task.length - 1);
        var remainingDependencies = dependencies.length;

        checkForDeadlocks();

        function checkForDeadlocks() {
            var len = dependencies.length;
            var dep;
            while (len--) {
                if (!(dep = tasks[dependencies[len]])) {
                    throw new Error('async.auto task `' + key +
                        '` has non-existent dependency in ' +
                        dependencies.join(', '));
                }
                if (isArray(dep) && indexOf(dep, key, 0) >= 0) {
                    throw new Error('async.auto task `' + key +
                        '`Has cyclic dependencies');
                }
            }
        }

        arrayEach(dependencies, function (dependencyName) {
            addListener(dependencyName, function () {
                remainingDependencies--;
                if (remainingDependencies === 0) {
                    enqueueTask(key, task);
                }
            });
        });
    });

    processQueue();


    function enqueueTask(key, task) {
        readyTasks.push(function () {
            runTask(key, task);
        });
    }

    function processQueue() {
        if (readyTasks.length === 0 && runningTasks === 0) {
            return callback(null, results);
        }
        while(readyTasks.length && runningTasks < concurrency) {
            var run = readyTasks.shift();
            run();
        }

    }

    function addListener(taskName, fn) {
        var taskListeners = listeners[taskName];
        if (!taskListeners) {
            taskListeners = listeners[taskName] = [];
        }

        taskListeners.push(fn);
    }

    function taskComplete(taskName) {
        var taskListeners = listeners[taskName] || [];
        arrayEach(taskListeners, function (fn) {
            fn();
        });
        processQueue();
    }


    function runTask(key, task) {
        if (hasError) return;

        var taskCallback = onlyOnce(rest(function(err, args) {
            runningTasks--;
            if (args.length <= 1) {
                args = args[0];
            }
            if (err) {
                var safeResults = {};
                forOwn(results, function(val, rkey) {
                    safeResults[rkey] = val;
                });
                safeResults[key] = args;
                hasError = true;
                listeners = [];

                callback(err, safeResults);
            } else {
                results[key] = args;
                taskComplete(key);
            }
        }));

        runningTasks++;
        var taskFn = task[task.length - 1];
        if (task.length > 1) {
            taskFn(results, taskCallback);
        } else {
            taskFn(taskCallback);
        }
    }


}
