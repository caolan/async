'use strict';

var reject = require('async.util.reject');
var doSeries = require('async.util.doseries');

module.exports = doSeries(reject);
