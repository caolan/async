'use strict';

var parallel = require('async.util.parallel');
var eachOfSeries = require('async.eachofseries');

module.exports = function series(tasks, cb) {
    return parallel(eachOfSeries, tasks, cb);
};
