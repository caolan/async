'use strict';

var eachOf = require('../eachof');
var withoutIndex = require('../util/withoutindex/');

module.exports = function each(arr, iterator, cb) {
    return eachOf(arr, withoutIndex(iterator), cb);
};
