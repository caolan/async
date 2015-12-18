'use strict';

var doWhilst = require('../dowhilst');

module.exports = function doUntil(iterator, test, cb) {
    return doWhilst(iterator, function() {
        return !test.apply(this, arguments);
    }, cb);
};
