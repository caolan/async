var requirejs = require('requirejs');
var assert = require('assert');
var util = require('util');
var async = require('../lib/async');

requirejs.config({
    //Pass the top-level main.js/index.js require
    //function to requirejs so that node modules
    //are loaded relative to the top-level JS file.
    nodeRequire: require
});

requirejs(['../lib/async'],function(async2) {
	console.log(util.inspect(async));
	console.log(util.inspect(async2));
	assert.equal(util.inspect(async, true), util.inspect(async2, true));
});