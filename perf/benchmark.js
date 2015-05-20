#!/usr/bin/env node

/**
 * Compare the performance of any two tagged versions of async.  Can also
 * compare any tag with what is in the current working directory.
 *
 * Usage:
 *
 *     perf/benchmark.js 0.9.2 0.9.0
 *
 * Compare version 0.9.0 with version 0.9.2
 *
 *     perf/benchmark.js 0.6.0
 *
 * Compare version 0.6.0 with the current working version
 *
 *     perf/benchmark.js
 *
 * Compare the current working version with the latest tagged version.
 */

var _ = require("lodash");
var Benchmark = require("benchmark");
var benchOptions = {defer: true, minSamples: 1, maxTime: 2};
var exec = require("child_process").exec;
var fs = require("fs");
var path = require("path");
var mkdirp = require("mkdirp");
var async = require("../");
var suiteConfigs = require("./suites");

var version0 = process.argv[2] || require("../package.json").version;
var version1 = process.argv[3] || "current";
var versionNames = [version0, version1];
var versions;
var wins = {};
var totalTime = {};
totalTime[version0] = wins[version0] = 0;
totalTime[version1] = wins[version1] = 0;

console.log("Comparing " + version0 + " with " + version1);
console.log("--------------------------------------");


async.eachSeries(versionNames, cloneVersion, function (err) {
  versions = versionNames.map(requireVersion);

  var suites = suiteConfigs
    .map(setDefaultOptions)
    .reduce(handleMultipleArgs, [])
    .map(setName)
    .map(createSuite);

  async.eachSeries(suites, runSuite, function () {
    var totalTime0 = Math.round(totalTime[version0]);
    var totalTime1 = Math.round(totalTime[version1]);

    if ( Math.abs((totalTime0 / totalTime1) - 1) < 0.01) {
      // if < 1% difference, we're likely within the margins of error
      console.log("Both versions are about equal " +
        "(" + totalTime0 + "ms total vs. " + totalTime1  + "ms total)");
    } else if (totalTime0 < totalTime1) {
      console.log(version0 + " faster overall " +
        "(" + totalTime0 + "ms total vs. " + totalTime1  + "ms total)");
    } else if (totalTime1 < totalTime0) {
      console.log(version1 + " faster overall " +
        "(" + totalTime1 + "ms total vs. " + totalTime0  + "ms total)");
    }
  });
});

function runSuite(suite, callback) {
  suite.on("complete", function () {
    callback();
  }).run({async: true});
}

function setDefaultOptions(suiteConfig) {
  suiteConfig.args = suiteConfig.args || [[]];
  suiteConfig.setup = suiteConfig.setup || function () {};
  return suiteConfig;
}

function handleMultipleArgs(list, suiteConfig) {
  return list.concat(suiteConfig.args.map(function (args) {
    return _.defaults({args: args}, suiteConfig);
  }));
}

function setName(suiteConfig) {
  suiteConfig.name = suiteConfig.name + "(" + suiteConfig.args.join(",") + ")";
  return suiteConfig;
}

function createSuite(suiteConfig) {
  var suite = new Benchmark.Suite();
  var args = suiteConfig.args;

  function addBench(version, versionName) {
    var name = suiteConfig.name + " " + versionName;
    suite.add(name, function (deferred) {
      suiteConfig.fn(versions[0], function () {
        deferred.resolve();
      });
    }, _.extend({
      versionName: versionName,
      setup: _.partial.apply(null, [suiteConfig.setup].concat(args))
    }, benchOptions));
  }

  addBench(versions[0], versionNames[0]);
  addBench(versions[1], versionNames[1]);


  return suite.on('cycle', function(event) {
    var mean = event.target.stats.mean * 1000;
    console.log(event.target + ", " + mean.toFixed(1) + "ms per sample");
    var version = event.target.options.versionName;
    totalTime[version] += mean;
  })
  .on('complete', function() {
    var fastest = this.filter('fastest');
    if (fastest.length === 2) {
      console.log("Tie");
    } else {
      var winner = fastest[0].options.versionName;
      console.log(winner + ' is faster');
      wins[winner]++;
    }
    console.log("--------------------------------------");
  });

}

function requireVersion(tag) {
  if (tag === "current") {
    return async;
  }

  return require("./versions/" + tag + "/");
}

function cloneVersion(tag, callback) {
  if (tag === "current") return callback();

  var versionDir = __dirname + "/versions/" + tag;
  mkdirp.sync(versionDir);
  fs.open(versionDir + "/package.json", "r", function (err, handle) {
    if (!err) {
      // version has already been cloned
      fs.close(handle);
      return callback();
    }

    var repoPath = path.join(__dirname, "..");

    var cmd = "git clone --branch " + tag + " " + repoPath + " " + versionDir;

    exec(cmd, function (err, stdout, stderr) {
      if (err) {
        throw err;
      }
      callback();
    });

  });
}
