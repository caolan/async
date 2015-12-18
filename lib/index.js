'use strict';

var async = {};

async.nextTick = require('./util/nexttick');
async.setImmediate = require('./util/setimmediate');

async.forEach =
async.each = require('./each');

async.forEachSeries =
async.eachSeries = require('./eachseries/');

async.forEachLimit =
async.eachLimit = require('./eachlimit');

async.forEachOf =
async.eachOf = require('./eachof');

async.forEachOfSeries =
async.eachOfSeries = require('./eachofseries');

async.forEachOfLimit =
async.eachOfLimit = require('./eachoflimit');

async.map = require('./map');
async.mapSeries = require('./mapseries');
async.mapLimit = require('./maplimit');

async.inject =
async.foldl =
async.reduce = require('./reduce');

async.foldr =
async.reduceRight = require('./reduceright');

async.transform = require('./transform');

async.select =
async.filter = require('./filter');

async.selectLimit =
async.filterLimit = require('./filterlimit');

async.selectSeries =
async.filterSeries = require('./filterseries');

async.reject = require('./reject');
async.rejectLimit = require('./rejectlimit');
async.rejectSeries = require('./rejectseries');

async.any =
async.some = require('./some');

async.someLimit = require('./somelimit');

async.all =
async.every = require('./every');

async.everyLimit = require('./everylimit');

async.detect = require('./detect');
async.detectSeries = require('./detectseries');
async.detectLimit = require('./detectlimit');

async.sortBy = require('./sortby');

async.auto = require('./auto');

async.retry = require('./retry');

async.waterfall = require('./waterfall');

async.parallel = require('./parallel');

async.parallelLimit = require('./parallellimit');

async.series = require('./series');

async.iterator = require('./iterator');

async.apply = require('./apply');

async.concat = require('./concat');
async.concatSeries = require('./concatseries');

async.whilst = require('./whilst');

async.doWhilst = require('./dowhilst');

async.until = require('./until');

async.doUntil = require('./dountil');

async.during = require('./during');

async.doDuring = require('./doduring');

async.queue = require('./queue');

async.priorityQueue = require('./priorityqueue');

async.cargo = require('./cargo');

async.log = require('./log');
async.dir = require('./dir');

async.memoize = require('./memoize');

async.unmemoize = require('./unmemoize');

async.times = require('./times');
async.timesSeries = require('./timesseries');
async.timesLimit = require('./timeslimit');

async.seq = require('./seq');

async.compose = require('./compose');

async.applyEach = require('./applyeach');
async.applyEachSeries = require('./applyeachseries');

async.forever = require('./forever');

async.ensureAsync = require('./util/ensureasync');

async.constant = require('./constant');

async.wrapSync =
async.asyncify = require('./util/asyncify');

module.exports = async;
