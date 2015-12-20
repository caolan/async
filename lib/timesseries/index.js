'use strict';

var times = require('async.util.times');
var mapSeries = require('async.mapseries');

module.exports = times(mapSeries);
