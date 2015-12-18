'use strict';

var _eachOfLimit = require('../util/eachoflimit');
var withoutIndex = require('../util/withoutindex');

module.exports = function eachLimit(arr, limit, iterator, cb) {
    return _eachOfLimit(limit)(arr, withoutIndex(iterator), cb);
};
