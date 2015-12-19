'use strict';

var range = require('async.util.range');
var mapLimit = require('async.maplimit');

module.exports = function timeLimit(count, limit, iterator, cb) {
    return mapLimit(range(count), limit, iterator, cb);
};
