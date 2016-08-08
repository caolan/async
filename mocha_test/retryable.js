var async = require('../lib');
var expect = require('chai').expect;
var assert = require('assert');

describe('retryable', function () {
    it('basics', function (done) {
        var calls = 0;
        var retryableTask = async.retryable(3, function (arg, cb) {
            calls++;
            expect(arg).to.equal(42);
            cb('fail');
        });

        retryableTask(42, function (err) {
            expect(err).to.equal('fail');
            expect(calls).to.equal(3);
            done();
        });
    });

    it('basics with error test function', function (done) {
        var calls = 0;
        var special = 'special';
        var opts = {
            errorFilter: function(err) {
                return err == special;
            }
        };
        var retryableTask = async.retryable(opts, function (arg, cb) {
            calls++;
            expect(arg).to.equal(42);
            cb(calls === 3 ? 'fail' : special);
        });

        retryableTask(42, function (err) {
            expect(err).to.equal('fail');
            expect(calls).to.equal(3);
            done();
        });
    });

    it('should work as an embedded task', function(done) {
        var retryResult = 'RETRY';
        var fooResults;
        var retryResults;

        async.auto({
            dep: async.constant('dep'),
            foo: ['dep', function(results, callback){
                fooResults = results;
                callback(null, 'FOO');
            }],
            retry: ['dep', async.retryable(function(results, callback) {
                retryResults = results;
                callback(null, retryResult);
            })]
        }, function(err, results){
            assert.equal(results.retry, retryResult, "Incorrect result was returned from retry function");
            assert.equal(fooResults, retryResults, "Incorrect results were passed to retry function");
            done();
        });
    });

    it('should work as an embedded task with interval', function(done) {
        var start = new Date().getTime();
        var opts = {times: 5, interval: 20};

        async.auto({
            foo: function(callback){
                callback(null, 'FOO');
            },
            retry: async.retryable(opts, function(callback) {
                callback('err');
            })
        }, function(){
            var duration = new Date().getTime() - start;
            var expectedMinimumDuration = (opts.times -1) * opts.interval;
            assert(duration >= expectedMinimumDuration,
                "The duration should have been greater than " +
                expectedMinimumDuration + ", but was " + duration);
            done();
        });
    });
});
