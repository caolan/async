'use strict';

var whilst = require('../whilst');

module.exports = function doWhilst(iterator, test, cb) {
    var calls = 0;
    return whilst(function() {
        return ++calls <= 1 || test.apply(this, arguments);
    }, iterator, cb);
};
