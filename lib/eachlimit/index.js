'use strict';

var eachOfLimit = require('async.util.eachoflimit');
var withoutIndex = require('async.util.withoutindex');

module.exports = function eachLimit(arr, limit, iterator, cb) {
    return eachOfLimit(limit)(arr, withoutIndex(iterator), cb);
};
