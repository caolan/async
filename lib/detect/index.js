'use strict';

var eachOf = require('../eachof');
var identity = require('../util/identity');
var createTester = require('../util/createtester');
var findGetResult = require('../util/findgetresult');

module.exports = createTester(eachOf, identity, findGetResult);
