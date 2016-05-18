var async = require('../lib');
var expect = require('chai').expect;
var assert = require('assert');

describe("retry", function () {

    // Issue 306 on github: https://github.com/caolan/async/issues/306
    it('retry when attempt succeeds',function(done) {
        var failed = 3;
        var callCount = 0;
        var expectedResult = 'success';
        function fn(callback) {
            callCount++;
            failed--;
            if (!failed) callback(null, expectedResult);
            else callback(true); // respond with error
        }
        async.retry(fn, function(err, result){
            assert(err === null, err + " passed instead of 'null'");
            assert.equal(callCount, 3, 'did not retry the correct number of times');
            assert.equal(result, expectedResult, 'did not return the expected result');
            done();
        });
    });

    it('retry when all attempts fail',function(done) {
        var times = 3;
        var callCount = 0;
        var error = 'ERROR';
        var erroredResult = 'RESULT';
        function fn(callback) {
            callCount++;
            callback(error + callCount, erroredResult + callCount); // respond with indexed values
        }
        async.retry(times, fn, function(err, result){
            assert.equal(callCount, 3, "did not retry the correct number of times");
            assert.equal(err, error + times, "Incorrect error was returned");
            assert.equal(result, erroredResult + times, "Incorrect result was returned");
            done();
        });
    });

    it('retry fails with invalid arguments',function(done) {
        expect(function() {
            async.retry("");
        }).to.throw();
        expect(function() {
            async.retry();
        }).to.throw();
        expect(function() {
            async.retry(function() {}, 2, function() {});
        }).to.throw();
        done();
    });

    it('retry with interval when all attempts fail',function(done) {
        var times = 3;
        var interval = 50;
        var callCount = 0;
        var error = 'ERROR';
        var erroredResult = 'RESULT';
        function fn(callback) {
            callCount++;
            callback(error + callCount, erroredResult + callCount); // respond with indexed values
        }
        var start = new Date().getTime();
        async.retry({ times: times, interval: interval}, fn, function(err, result){
            var now = new Date().getTime();
            var duration = now - start;
            assert(duration >= (interval * (times -1)),  'did not include interval');
            assert.equal(callCount, 3, "did not retry the correct number of times");
            assert.equal(err, error + times, "Incorrect error was returned");
            assert.equal(result, erroredResult + times, "Incorrect result was returned");
            done();
        });
    });

    it('retry with custom interval when all attempts fail',function(done) {
        var times = 3;
        var intervalFunc = function(retryCount) { return retryCount * 100; };
        var callCount = 0;
        var error = 'ERROR';
        var erroredResult = 'RESULT';
        function fn(callback) {
            callCount++;
            callback(error + callCount, erroredResult + callCount); // respond with indexed values
        }
        var start = new Date().getTime();
        async.retry({ times: times, interval: intervalFunc}, fn, function(err, result){
            var now = new Date().getTime();
            var duration = now - start;
            assert(duration >= 300,  'did not include custom interval');
            assert.equal(callCount, 3, "did not retry the correct number of times");
            assert.equal(err, error + times, "Incorrect error was returned");
            assert.equal(result, erroredResult + times, "Incorrect result was returned");
            done();
        });
    });

    it("should not require a callback", function (done) {
        var called = false;
        async.retry(3, function(cb) {
            called = true;
            cb();
        });
        setTimeout(function () {
            assert(called);
            done();
        }, 10);
    });

    it("should not require a callback and use the default times", function (done) {
        var calls = 0;
        async.retry(function(cb) {
            calls++;
            cb("fail");
        });
        setTimeout(function () {
            expect(calls).to.equal(5);
            done();
        }, 50);
    });
});
