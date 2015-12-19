'use strict';

var async = {};

async.nextTick = require('async.nexttick');
async.setImmediate = require('async.setimmediate');

async.forEach =
async.each = require('async.each');

async.forEachSeries =
async.eachSeries = require('async.eachseries');

async.forEachLimit =
async.eachLimit = require('async.eachlimit');

async.forEachOf =
async.eachOf = require('async.eachof');

async.forEachOfSeries =
async.eachOfSeries = require('async.eachofseries');

async.forEachOfLimit =
async.eachOfLimit = require('async.eachoflimit');

async.map = require('async.map');
async.mapSeries = require('async.mapseries');
async.mapLimit = require('async.maplimit');

async.inject =
async.foldl =
async.reduce = require('async.reduce');

async.foldr =
async.reduceRight = require('async.reduceright');

async.transform = require('async.transform');

async.select =
async.filter = require('async.filter');

async.selectLimit =
async.filterLimit = require('async.filterlimit');

async.selectSeries =
async.filterSeries = require('async.filterseries');

async.reject = require('async.reject');
async.rejectLimit = require('async.rejectlimit');
async.rejectSeries = require('async.rejectseries');

async.any =
async.some = require('async.some');

async.someLimit = require('async.somelimit');

async.all =
async.every = require('async.every');

async.everyLimit = require('async.everylimit');

async.detect = require('async.detect');
async.detectSeries = require('async.detectseries');
async.detectLimit = require('async.detectlimit');

async.sortBy = require('async.sortby');

async.auto = require('async.auto');

async.retry = require('async.retry');

async.waterfall = require('async.waterfall');

async.parallel = require('async.parallel');

async.parallelLimit = require('async.parallellimit');

async.series = require('async.series');

async.iterator = require('async.iterator');

async.apply = require('async.apply');

async.concat = require('async.concat');
async.concatSeries = require('async.concatseries');

async.whilst = require('async.whilst');

async.doWhilst = require('async.dowhilst');

async.until = require('async.until');

async.doUntil = require('async.dountil');

async.during = require('async.during');

async.doDuring = require('async.doduring');

async.queue = require('async.queue');

async.priorityQueue = require('async.priorityqueue');

async.cargo = require('async.cargo');

async.log = require('async.log');
async.dir = require('async.dir');

async.memoize = require('async.memoize');

async.unmemoize = require('async.unmemoize');

async.times = require('async.times');
async.timesSeries = require('async.timesseries');
async.timesLimit = require('async.timeslimit');

async.seq = require('async.seq');

async.compose = require('async.compose');

async.applyEach = require('async.applyeach');
async.applyEachSeries = require('async.applyeachseries');

async.forever = require('async.forever');

async.ensureAsync = require('async.ensureasync');

async.constant = require('async.constant');

async.wrapSync =
async.asyncify = require('async.asyncify');

module.exports = async;
