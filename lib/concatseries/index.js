'use strict';

var concat = require('async.util.concat');
var doSeries = require('async.util.doseries');

module.exports = doSeries(concat);
