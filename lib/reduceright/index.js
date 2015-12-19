'use strict';

var map = require('async.util.map');
var reduce = require('async.reduce');
var identity = require('async.util.identity');

module.exports = function reduceRight (arr, memo, iterator, cb) {
    var reversed = map(arr, identity).reverse();
    reduce(reversed, memo, iterator, cb);
};
