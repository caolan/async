#!/usr/bin/env node

var Benchmark = require("benchmark");
var benchOptions = {defer: true, minSamples: 7};
var exec = require("child_process").exec;
var fs = require("fs");
var mkdirp = require("mkdirp");
var async = require("../");
var suiteConfigs = require("./suites");

var version1 = process.argv[2] || require("../package.json").version;
var version2 = process.argv[3] || "current";
var versionNames = [version1, version2];
var versions;
var wins = [0, 0];

console.log("Comparing " + version1 + " with " + version2);
console.log("--------------------------------------");


async.eachSeries(versionNames, cloneVersion, function (err) {
  versions = versionNames.map(requireVersion);

  var suites = suiteConfigs.map(createSuite);

  async.eachSeries(suites, runSuite, function () {
    var wins0 = wins[0].length;
    var wins1 = wins[1].length;

    if (wins0 > wins1) {
      console.log(versionNames[0] + " faster overall " +
        "(" + wins0 + " wins vs. " + wins1  +" wins)");
    } else if (wins1 > wins0) {
      console.log(versionNames[1] + " faster overall " +
        "(" + wins1 + " wins vs. " + wins0  +" wins)");
    } else {
      console.log("Both versions are equal");
    }
  });
});

function runSuite(suite, callback) {
  suite.on("complete", function () {
    callback();
  }).run({async: true});
}

function createSuite(suiteConfig) {
  var suite = new Benchmark.Suite();

  function addBench(version, versionName) {
    var title = suiteConfig.name + " " + versionName;
    suite.add(title, function (deferred) {
      suiteConfig.fn(versions[0], deferred);
    }, benchOptions);
  }

  addBench(versions[0], versionNames[0]);
  addBench(versions[1], versionNames[1]);

  return suite.on('cycle', function(event) {
    console.log(event.target + "");
  })
  .on('complete', function() {
    var fastest = this.filter('fastest');
    if (fastest.length === 2) {
      console.log("Tie");
    } else {
      console.log(fastest[0].name + ' is faster');
      var index = this.indexOf("fastest");
      wins[index]++;
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

    var cmd = "git clone --branch " + tag + " ../ " + versionDir;

    exec(cmd, function (err, stdout, stderr) {
      if (err) {
        throw err;
      }
      callback();
    });

  });
}
