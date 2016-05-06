var async = require('../lib');
var assert = require('assert');

describe('timeout', function () {

    it('timeout with series', function(done){
        async.series([
            async.timeout(function asyncFn(callback) {
                setTimeout(function() {
                    callback(null, 'I didn\'t time out');
                }, 25);
            }, 50),
            async.timeout(function asyncFn(callback) {
                setTimeout(function() {
                    callback(null, 'I will time out');
                }, 75);
            }, 50)
        ],
        function(err, results) {
            assert(err.message === 'Callback function "asyncFn" timed out.');
            assert(err.code === 'ETIMEDOUT');
            assert(err.info === undefined);
            assert(results[0] === 'I didn\'t time out');
            done();
        });
    });

    it('timeout with series and info', function (done) {
        var info = { custom: 'info about callback' };
        async.series([
            async.timeout(function asyncFn(callback) {
                setTimeout(function() {
                    callback(null, 'I didn\'t time out');
                }, 25);
            }, 50),
            async.timeout(function asyncFn(callback) {
                setTimeout(function() {
                    callback(null, 'I will time out');
                }, 75);
            }, 50, info)
        ],
        function(err, results) {
            assert(err.message === 'Callback function "asyncFn" timed out.');
            assert(err.code === 'ETIMEDOUT');
            assert(err.info === info);
            assert(results[0] === 'I didn\'t time out');
            done();
        });
    });

    it('timeout with parallel', function(done){
        async.parallel([
            async.timeout(function asyncFn(callback) {
                setTimeout(function() {
                    callback(null, 'I didn\'t time out');
                }, 25);
            }, 50),
            async.timeout(function asyncFn(callback) {
                setTimeout(function() {
                    callback(null, 'I will time out');
                }, 75);
            }, 50)
        ],
        function(err, results) {
            assert(err.message === 'Callback function "asyncFn" timed out.');
            assert(err.code === 'ETIMEDOUT');
            assert(err.info === undefined);
            assert(results[0] === 'I didn\'t time out');
            done();
        });
    });
});
