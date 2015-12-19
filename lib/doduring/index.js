'use strict';

var during = require('async.during');

module.exports = function doDuring(iterator, test, cb) {
    var calls = 0;

    during(function(next) {
        if (calls++ < 1) return next(null, true);
        test.apply(this, arguments);
    }, iterator, cb);
};
