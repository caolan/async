'use strict';

import isArray from 'lodash/isArray';
import noop from 'lodash/noop';
import once from './internal/once';
import rest from 'lodash/rest';

import onlyOnce from './internal/onlyOnce';

export default  function(tasks, cb) {
    cb = once(cb || noop);
    if (!isArray(tasks)) return cb(new Error('First argument to waterfall must be an array of functions'));
    if (!tasks.length) return cb();
    var taskIndex = 0;

    function nextTask(args) {
        if (taskIndex === tasks.length) {
            return cb.apply(null, [null].concat(args));
        }

        var taskCallback = onlyOnce(rest(function(err, args) {
            if (err) {
                return cb.apply(null, [err].concat(args));
            }
            nextTask(args);
        }));

        args.push(taskCallback);

        var task = tasks[taskIndex++];
        task.apply(null, args);
    }

    nextTask([]);
}
