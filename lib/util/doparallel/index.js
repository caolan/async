'use strict';

var eachOf = require('../../eachof');

module.exports = function doParallel(fn) {
    return function(obj, iterator, cb) {
        return fn(eachOf, obj, iterator, cb);
    };
};
