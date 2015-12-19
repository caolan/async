'use strict';

var fs = require('fs');
var path = require('path');
var jsonFuture = require('json-future');

var BLACKLIST = [
    'index.js'
];

function sanetize(array) {
    BLACKLIST.forEach(function(blackItem) {
        var index = array.indexOf(blackItem);
        if (index > -1) array.splice(index, 1);
    });

    return array;
}

module.exports = function(modulesPath, cb) {
    var files = fs.readdirSync(modulesPath);
    var modules = sanetize(files);
    var modulesPathDist = path.resolve(__dirname, 'index.json');
    jsonFuture.save(modulesPathDist, modules, {
        indent: 2
    }, cb);
};
