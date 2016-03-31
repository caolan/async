'use strict';

import isArray from 'lodash/isArray';
import each from 'lodash/each';
import noop from 'lodash/noop';
import once from './internal/once';

export default function race(tasks, cb) {
    cb = once(cb || noop);
    if (!isArray(tasks)) return cb(new TypeError('First argument to race must be an array of functions'));
    if (!tasks.length) return cb();
    each(tasks, function (task) {
        task(cb);
    });
}
