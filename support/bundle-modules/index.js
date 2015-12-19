'use strict';

var path = require('path');
var jsonFuture = require('json-future');
var restParam = require('lodash.restparam');
var generatePackage = require('./generate-package');
var MODULES_PATH = path.resolve(__dirname, '..', '..', 'lib');
var bundleModulesNames = require('./names/build');

var getModulePath = restParam(function(paths) {
    paths = [MODULES_PATH].concat(paths);
    return path.resolve.apply(null, paths);
});

function buildPackage(module) {
    var modulePath = path.resolve(getModulePath(module), 'package.json');
    var modulePkg = generatePackage(module);

    jsonFuture.save(modulePath, modulePkg, {
        indent: 2,
        sortKeys: true
    });
}

module.exports = (function() {
    bundleModulesNames(MODULES_PATH);
    return {
        rootPath: getModulePath,
        modules: require('./names'),
        descriptions: require('./descriptions.json'),
        buildPackage: buildPackage,
    };
})();
