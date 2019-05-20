#!/usr/bin/env node

var fs = require('fs');
var json = JSON.parse(fs.readFileSync(__dirname + "/../package.json"), "utf8");

json.name = "async-es";
json.main = "index.js";
json.module = "index.js";
json.sideEffects = false;

process.stdout.write(JSON.stringify(json, null, 2));


