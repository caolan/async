'use strict';

var noop = require('../util/noop');
var restParam = require('../util/restparam');

module.exports = function whilst(test, iterator, cb) {
    cb = cb || noop;
    if (!test()) return cb(null);
    var next = restParam(function(err, args) {
        if (err) return cb(err);
        if (test.apply(this, args)) return iterator(next);
        cb.apply(null, [null].concat(args));
    });
    iterator(next);
};
