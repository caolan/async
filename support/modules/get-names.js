'use strict';

var fs = require('fs');

function removeIndex(array) {
    var index = array.indexOf('index.js');
    if (index > -1) array.splice(index, 1);
    return array;
}

module.exports = function(modulesPath, cb) {
    fs.readdir(modulesPath, function(err, files) {
        return cb(err, removeIndex(files));
    });
};
