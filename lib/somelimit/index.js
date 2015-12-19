'use strict';

var eachOfLimit = require('async.eachoflimit');
var toBool = require('async.util.tobool');
var identity = require('async.util.identity');
var createTester = require('async.util.createtester');

module.exports = createTester(eachOfLimit, toBool, identity);
