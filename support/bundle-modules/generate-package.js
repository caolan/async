'use strict';

var pkg = require('../../package.json');
var descriptions = require('./descriptions.json');

function generateKeywords(name) {
    var keywords = [
        'async',
        'async-modularized'
    ];

    keywords.push(name);
    return keywords;
}

function generateDefaultFields(name) {
    var ORIGINAL_FIELDS = [
        'author',
        'version',
        'repository',
        'license'
    ];

    var structure = {
        name: 'async.' + name,
        main: './index.js',
        browser: './dist/async.' + name + '.js'
    };


    ORIGINAL_FIELDS.forEach(function(field) {
        structure[field] = pkg[field];
    });

    return structure;
}

function generateDescription(name) {
    return descriptions[name];
}


module.exports = function(name) {
    var modulePackage = generateDefaultFields(name);
    modulePackage.description = generateDescription(name);
    modulePackage.keywords = generateKeywords(name);
    return modulePackage;
};
