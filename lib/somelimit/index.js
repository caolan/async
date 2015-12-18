'use strict';

var eachOfLimit = require('../eachoflimit');
var toBool = require('../util/tobool');
var identity = require('../util/identity/');
var createTester = require('../util/createtester');

module.exports = createTester(eachOfLimit, toBool, identity);
