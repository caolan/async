#!/usr/bin/env node

var fs = require('fs');
var json = JSON.parse(fs.readFileSync(__dirname + "/../package.json"), "utf8");

json.name = "async-es";
json.main = "index.js";
delete json.dependencies["lodash"];
delete json.volo;
delete json.spm;
delete json.jam;

process.stdout.write(JSON.stringify(json, null, 2));


