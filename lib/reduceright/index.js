'use strict';

var map = require('../util/map');
var reduce = require('../reduce');
var identity = require('../util/identity');

module.exports = function reduceRight (arr, memo, iterator, cb) {
    var reversed = map(arr, identity).reverse();
    reduce(reversed, memo, iterator, cb);
};
