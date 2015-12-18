'use strict';

var path = require('path');
var getNames = require('./get-names');
var jsonFuture = require('json-future');
var MODULES_PATH = path.resolve(__dirname, '..', '..', 'lib');
var generatePackage = require('./generate-package');

function buildPackage(module) {
    var modulePath = path.resolve(MODULES_PATH, module, 'package.json');
    var modulePkg = generatePackage(module);

    jsonFuture.save(modulePath, modulePkg, {
        indent: 2,
        sortKeys: true
    });
}




module.exports = function() {
    getNames(MODULES_PATH, function(err, modules) {
        modules.forEach(function(module) {
            buildPackage(module);
        });
    });
};
