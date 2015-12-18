'use strict';

var identity = require('../util/identity');
var eachOfSeries = require('../eachofseries');
var createTester = require('../util/createtester');
var findGetResult = require('../util/findgetresult');

module.exports = createTester(eachOfSeries, identity, findGetResult);
