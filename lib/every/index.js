'use strict';

var eachOf = require('async.eachof');
var notId = require('async.util.notid/');
var createTester = require('async.util.createtester');

module.exports = createTester(eachOf, notId, notId);
