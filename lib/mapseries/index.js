'use strict';
var mapAsync = require('../util/mapasync');
var doSeries = require('../util/doseries');
module.exports = doSeries(mapAsync);
