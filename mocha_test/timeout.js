var async = require('../lib');
var expect = require('chai').expect;

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
            expect(err.message).to.equal('Callback function "asyncFn" timed out.');
            expect(err.code).to.equal('ETIMEDOUT');
            expect(err.info).to.equal(undefined);
            expect(results[0]).to.equal('I didn\'t time out');
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
            expect(err.message).to.equal('Callback function "asyncFn" timed out.');
            expect(err.code).to.equal('ETIMEDOUT');
            expect(err.info).to.equal(info);
            expect(results[0]).to.equal('I didn\'t time out');
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
            expect(err.message).to.equal('Callback function "asyncFn" timed out.');
            expect(err.code).to.equal('ETIMEDOUT');
            expect(err.info).to.equal(undefined);
            expect(results[0]).to.equal('I didn\'t time out');
            done();
        });
    });
});
