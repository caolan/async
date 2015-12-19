'use strict';

var eachOfLimit = require('async.eachoflimit');
var notId = require('async.util.notid');
var createTester = require('async.util.createtester');

module.exports = createTester(eachOfLimit, notId, notId);
