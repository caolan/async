'use strict';

import isArray from 'lodash/isArray';
import noop from 'lodash/noop';
import once from 'lodash/once';

export default function race(tasks, cb) {
    cb = once(cb || noop);
    if (!isArray(tasks)) return cb(new TypeError('First argument to race must be an array of functions'));
    if (!tasks.length) return cb();
    for (let i = 0; i < tasks.length; i++) {
        tasks[i](cb);
    }
}
