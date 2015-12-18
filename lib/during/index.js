'use strict';

var noop = require('../util/noop');
var restParam = require('../util/restparam');

module.exports = function during(test, iterator, cb) {
    cb = cb || noop;

    var next = restParam(function(err, args) {
        if (err) {
            cb(err);
        } else {
            args.push(check);
            test.apply(this, args);
        }
    });

    var check = function(err, truth) {
        if (err) return cb(err);
        if (!truth) return cb(null);
        iterator(next);
    };

    test(check);
};
