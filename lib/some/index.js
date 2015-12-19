'use strict';

var eachOf = require('async.eachof');
var toBool = require('async.util.tobool');
var identity = require('async.util.identity');
var createTester = require('async.util.createtester');

module.exports = createTester(eachOf, toBool, identity);
