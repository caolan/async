'use strict';

import isArray from 'lodash/isArray';
import noop from 'lodash/noop';
import once from 'lodash/once';
import rest from 'lodash/rest';

import ensureAsync from './ensureAsync';
import iterator from './iterator';

export default  function(tasks, cb) {
    cb = once(cb || noop);
    if (!isArray(tasks)) return cb(new Error('First argument to waterfall must be an array of functions'));
    if (!tasks.length) return cb();

    function wrapIterator(iterator) {
        return rest(function(err, args) {
            if (err) {
                cb.apply(null, [err].concat(args));
            } else {
                var next = iterator.next();
                if (next) {
                    args.push(wrapIterator(next));
                } else {
                    args.push(cb);
                }
                ensureAsync(iterator).apply(null, args);
            }
        });
    }
    wrapIterator(iterator(tasks))();
}
