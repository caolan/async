'use strict';
var mapAsync = require('async.util.mapasync');
var doSeries = require('async.util.doseries');
module.exports = doSeries(mapAsync);
