#!/usr/bin/env node

var fs = require('fs');
var json = JSON.parse(fs.readFileSync(__dirname + "/../package.json"), "utf8");
json.module = 'dist/async.mjs'

process.stdout.write(JSON.stringify(json, null, 2));
