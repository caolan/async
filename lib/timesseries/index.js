'use strict';

var times = require('async.util.times');
var mapSeries = require('async.mapSeries');

module.exports = times(mapSeries);
