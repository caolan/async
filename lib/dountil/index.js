'use strict';

var doWhilst = require('async.dowhilst');

module.exports = function doUntil(iterator, test, cb) {
    return doWhilst(iterator, function() {
        return !test.apply(this, arguments);
    }, cb);
};
