'use strict';

var eachOfSeries = require('async.eachofseries');
var withoutIndex = require('async.util.withoutindex');

module.exports = function eachSeries(arr, iterator, cb) {
    return eachOfSeries(arr, withoutIndex(iterator), cb);
};
