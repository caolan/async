'use strict';

var eachOf = require('async.eachof');
var withoutIndex = require('async.util.withoutindex');

module.exports = function each(arr, iterator, cb) {
    return eachOf(arr, withoutIndex(iterator), cb);
};
