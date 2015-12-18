'use strict';

var whilst = require('../whilst');

module.exports = function until(test, iterator, cb) {
    return whilst(function() {
        return !test.apply(this, arguments);
    }, iterator, cb);
};
