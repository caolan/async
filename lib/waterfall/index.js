'use strict';

var once = require('../util/once');
var noop = require('../util/noop');
var isArray = require('../util/isarray');
var restParam = require('../util/restparam');
var ensureAsync = require('../util/ensureasync');
var iterator = require('../iterator');


module.exports = function(tasks, cb) {
    cb = once(cb || noop);
    if (!isArray(tasks)) return cb(new Error('First argument to waterfall must be an array of functions'));
    if (!tasks.length) return cb();

    function wrapIterator(iterator) {
        return restParam(function(err, args) {
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
};
