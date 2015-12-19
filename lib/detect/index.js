'use strict';

var eachOf = require('async.eachof');
var identity = require('async.util.identity');
var createTester = require('async.util.createtester');
var findGetResult = require('async.util.findgetresult');

module.exports = createTester(eachOf, identity, findGetResult);
