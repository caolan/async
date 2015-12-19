'use strict';

var eachOfSeries = require('async.eachofseries');
var applyEach = require('async.util.applyeach');

module.exports = applyEach(eachOfSeries);
