'use strict';

var noop = require('../noop');
var restParam = require('../restparam');
var isArrayLike = require('../isarraylike');

module.exports = function parallel(eachfn, tasks, callback) {
    callback = callback || noop;
    var results = isArrayLike(tasks) ? [] : {};

    eachfn(tasks, function(task, key, callback) {
        task(restParam(function(err, args) {
            if (args.length <= 1) {
                args = args[0];
            }
            results[key] = args;
            callback(err);
        }));
    }, function(err) {
        callback(err, results);
    });
};
