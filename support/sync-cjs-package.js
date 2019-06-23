#!/usr/bin/env node

var fs = require('fs');
var json = JSON.parse(fs.readFileSync(__dirname + "/../package.json"), "utf8");
json.module = 'dist/async.mjs'
// mark this as an ES6 module for browserify
json.browserify = {
    transform: [["babelify", { presets: ["@babel/preset-env"] }]]
}

process.stdout.write(JSON.stringify(json, null, 2));
