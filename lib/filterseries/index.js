'use strict';

var filter = require('async.util.filter');
var doSeries = require('async.util.doseries');

module.exports = doSeries(filter);
