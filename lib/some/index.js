'use strict';

var eachOf = require('../eachof');
var toBool = require('../util/tobool');
var identity = require('../util/identity/');
var createTester = require('../util/createtester');

module.exports = createTester(eachOf, toBool, identity);
