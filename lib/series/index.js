'use strict';

var parallel = require('../util/parallel');
var eachOfSeries = require('../eachofseries');

module.exports = function series(tasks, cb) {
    return parallel(eachOfSeries, tasks, cb);
};
