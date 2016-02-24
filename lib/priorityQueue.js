'use strict';

import arrayEach from 'lodash/_arrayEach';
import isArray from 'lodash/isArray';
import noop from 'lodash/noop';

import setImmediate from './setImmediate';

import queue from './queue';

export default function(worker, concurrency) {
    function _compareTasks(a, b) {
        return a.priority - b.priority;
    }

    function _binarySearch(sequence, item, compare) {
        var beg = -1,
            end = sequence.length - 1;
        while (beg < end) {
            var mid = beg + ((end - beg + 1) >>> 1);
            if (compare(item, sequence[mid]) >= 0) {
                beg = mid;
            } else {
                end = mid - 1;
            }
        }
        return beg;
    }

    function _insert(q, data, priority, callback) {
        if (callback != null && typeof callback !== 'function') {
            throw new Error('task callback must be a function');
        }
        q.started = true;
        if (!isArray(data)) {
            data = [data];
        }
        if (data.length === 0) {
            // call drain immediately if there are no tasks
            return setImmediate(function() {
                q.drain();
            });
        }
        arrayEach(data, function(task) {
            var item = {
                data: task,
                priority: priority,
                callback: typeof callback === 'function' ? callback : noop
            };

            q.tasks.splice(_binarySearch(q.tasks, item, _compareTasks) + 1, 0, item);

            if (q.tasks.length === q.concurrency) {
                q.saturated();
            }
            if (q.tasks.length <= (q.concurrency - q.buffer) ) {
                q.unsaturated();
            }
            setImmediate(q.process);
        });
    }

    // Start with a normal queue
    var q = queue(worker, concurrency);

    // Override push to accept second parameter representing priority
    q.push = function(data, priority, callback) {
        _insert(q, data, priority, callback);
    };

    // Remove unshift function
    delete q.unshift;

    return q;
}
