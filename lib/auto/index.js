'use strict';

var once = require('async.util.once');
var noop = require('async.util.noop');
var _keys = require('async.util.keys');
var reduce = require('async.util.reduce');
var indexOf = require('async.util.indexof');
var isArray = require('async.util.isarray');
var arrayEach = require('async.util.arrayeach');
var restParam = require('async.util.restparam');
var forEachOf = require('async.util.foreachof');
var setImmediate = require('async.util.setimmediate');

module.exports = function auto(tasks, concurrency, cb) {
    if (typeof arguments[1] === 'function') {
        // concurrency is optional, shift the args.
        cb = concurrency;
        concurrency = null;
    }
    cb = once(cb || noop);
    var keys = _keys(tasks);
    var remainingTasks = keys.length;
    if (!remainingTasks) {
        return cb(null);
    }
    if (!concurrency) {
        concurrency = remainingTasks;
    }

    var results = {};
    var runningTasks = 0;

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
        arrayEach(listeners.slice(0), function(fn) {
            fn();
        });
    }

    addListener(function() {
        if (!remainingTasks) {
            cb(null, results);
        }
    });

    arrayEach(keys, function(k) {
        var task = isArray(tasks[k]) ? tasks[k] : [tasks[k]];
        var taskCallback = restParam(function(err, args) {
            runningTasks--;
            if (args.length <= 1) {
                args = args[0];
            }
            if (err) {
                var safeResults = {};
                forEachOf(results, function(val, rkey) {
                    safeResults[rkey] = val;
                });
                safeResults[k] = args;
                cb(err, safeResults);
            } else {
                results[k] = args;
                setImmediate(taskComplete);
            }
        });
        var requires = task.slice(0, task.length - 1);
        // prevent dead-locks
        var len = requires.length;
        var dep;
        while (len--) {
            if (!(dep = tasks[requires[len]])) {
                throw new Error('Has inexistant dependency');
            }
            if (isArray(dep) && indexOf(dep, k) >= 0) {
                throw new Error('Has cyclic dependencies');
            }
        }

        function ready() {
            return runningTasks < concurrency && reduce(requires, function(a, x) {
                return (a && results.hasOwnProperty(x));
            }, true) && !results.hasOwnProperty(k);
        }
        if (ready()) {
            runningTasks++;
            task[task.length - 1](taskCallback, results);
        } else {
            addListener(listener);
        }

        function listener() {
            if (ready()) {
                runningTasks++;
                removeListener(listener);
                task[task.length - 1](taskCallback, results);
            }
        }
    });
};
