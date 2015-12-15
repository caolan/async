'use strict';

var identity = require('async.util.identity');
var eachOfSeries = require('async.eachofseries');
var createTester = require('async.util.createtester');
var findGetResult = require('async.util.findgetresult');

module.exports = createTester(eachOfSeries, identity, findGetResult);
