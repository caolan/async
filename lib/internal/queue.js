'use strict';

import arrayEach from 'lodash/_arrayEach';
import arrayMap from 'lodash/_arrayMap';
import isArray from 'lodash/isArray';
import noop from 'lodash/noop';
import property from 'lodash/_baseProperty';

import onlyOnce from './onlyOnce';
import setImmediate from './setImmediate';

export default function queue(worker, concurrency, payload) {
    if (concurrency == null) {
        concurrency = 1;
    }
    else if(concurrency === 0) {
        throw new Error('Concurrency must not be zero');
    }
    function _insert(q, data, pos, callback) {
        if (callback != null && typeof callback !== 'function') {
            throw new Error('task callback must be a function');
        }
        q.started = true;
        if (!isArray(data)) {
            data = [data];
        }
        if(data.length === 0 && q.idle()) {
            // call drain immediately if there are no tasks
            return setImmediate(function() {
                q.drain();
            });
        }
        arrayEach(data, function(task) {
            var item = {
                data: task,
                callback: callback || noop
            };

            if (pos) {
                q.tasks.unshift(item);
            } else {
                q.tasks.push(item);
            }

            if (q.tasks.length === q.concurrency) {
                q.saturated();
            }
            if (q.tasks.length <= (q.concurrency - q.buffer) ) {
                q.unsaturated();
            }
        });
        setImmediate(q.process);
    }
    function _next(q, tasks) {
        return function(){
            workers -= 1;

            var removed = false;
            var args = arguments;
            arrayEach(tasks, function (task) {
                arrayEach(workersList, function (worker, index) {
                    if (worker === task && !removed) {
                        workersList.splice(index, 1);
                        removed = true;
                    }
                });

                task.callback.apply(task, args);
            });
            if (q.tasks.length + workers === 0) {
                q.drain();
            }
            q.process();
        };
    }

    var workers = 0;
    var workersList = [];
    var q = {
        tasks: [],
        concurrency: concurrency,
        payload: payload,
        saturated: noop,
        unsaturated:noop,
        buffer: concurrency / 4,
        empty: noop,
        drain: noop,
        started: false,
        paused: false,
        push: function (data, callback) {
            _insert(q, data, false, callback);
        },
        kill: function () {
            q.drain = noop;
            q.tasks = [];
        },
        unshift: function (data, callback) {
            _insert(q, data, true, callback);
        },
        process: function () {
            while(!q.paused && workers < q.concurrency && q.tasks.length){

                var tasks = q.payload ?
                    q.tasks.splice(0, q.payload) :
                    q.tasks.splice(0, q.tasks.length);

                var data = arrayMap(tasks, property('data'));

                if (q.tasks.length === 0) {
                    q.empty();
                }
                workers += 1;
                workersList.push(tasks[0]);
                var cb = onlyOnce(_next(q, tasks));
                worker(data, cb);
            }
        },
        length: function () {
            return q.tasks.length;
        },
        running: function () {
            return workers;
        },
        workersList: function () {
            return workersList;
        },
        idle: function() {
            return q.tasks.length + workers === 0;
        },
        pause: function () {
            q.paused = true;
        },
        resume: function () {
            if (q.paused === false) { return; }
            q.paused = false;
            var resumeCount = Math.min(q.concurrency, q.tasks.length);
            // Need to call q.process once per concurrent
            // worker to preserve full concurrency after pause
            for (var w = 1; w <= resumeCount; w++) {
                setImmediate(q.process);
            }
        }
    };
    return q;
}
