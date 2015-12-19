'use strict';

var fs = require('fs');
var path = require('path');
var term = require('oh-my-terminal');
var template = require('lodash.template');

var MODULES_PATH = './lib/';

function getFolders(dir) {
    return fs.readdirSync(dir)
        .filter(function(file) {
            return fs.statSync(path.join(dir, file)).isDirectory();
        });
}

module.exports = function(cmd) {
    getFolders(MODULES_PATH).forEach(function(module) {
        var command = ['cd lib/<%= name %>'].concat(cmd).join(' &&');
        var action = template(command)({name: module});
        var done =  term.exec(action);

        console.log("\n :: status for " + module + "::\n");
        console.log(done);
    });

};
