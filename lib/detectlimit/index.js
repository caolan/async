'use strict';

var identity = require('async.util.identity');
var eachOfLimit = require('async.eachoflimit');
var createTester = require('async.util.createtester');
var findGetResult = require('async.util.findgetresult');

module.exports = createTester(eachOfLimit, identity, findGetResult);
