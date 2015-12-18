'use strict';

var eachOfSeries = require('../eachofseries');
var withoutIndex = require('../util/withoutindex');

module.exports = function eachSeries(arr, iterator, cb) {
    return eachOfSeries(arr, withoutIndex(iterator), cb);
};
