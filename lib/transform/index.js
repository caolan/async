'use strict';

var eachOf = require('async.eachof');
var isArray = require('async.util.isarray');

module.exports = function transform (arr, memo, iterator, callback) {
    if (arguments.length === 3) {
        callback = iterator;
        iterator = memo;
        memo = isArray(arr) ? [] : {};
    }

    eachOf(arr, function(v, k, cb) {
        iterator(memo, v, k, cb);
    }, function(err) {
        callback(err, memo);
    });
};
