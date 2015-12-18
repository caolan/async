'use strict';

var range = require('../util/range');
var mapLimit = require('../maplimit');

module.exports = function timeLimit(count, limit, iterator, cb) {
    return mapLimit(range(count), limit, iterator, cb);
};
