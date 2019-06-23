var async = require('../lib');
var {expect} = require('chai');
var assert = require('assert');

describe('retryable', () => {
    it('basics', (done) => {
        var calls = 0;
        var retryableTask = async.retryable(3, (arg, cb) => {
            calls++;
            expect(arg).to.equal(42);
            cb('fail');
        });

        retryableTask(42, (err) => {
            expect(err).to.equal('fail');
            expect(calls).to.equal(3);
            done();
        });
    });

    it('success', (done) => {
        var calls = 0;
        var retryableTask = async.retryable(3, (arg, cb) => {
            calls++;
            expect(arg).to.equal(42);
            if (calls > 1) return cb (null, 1, 2)
            cb('fail');
        });

        retryableTask(42, (err, a, b) => {
            expect(err).to.eql(null);
            expect(calls).to.equal(2);
            expect([a, b]).to.eql([1, 2])
            done();
        });
    });

    it('basics with error test function', (done) => {
        var calls = 0;
        var special = 'special';
        var opts = {
            errorFilter(err) {
                return err == special;
            }
        };
        var retryableTask = async.retryable(opts, (arg, cb) => {
            calls++;
            expect(arg).to.equal(42);
            cb(calls === 3 ? 'fail' : special);
        });

        retryableTask(42, (err) => {
            expect(err).to.equal('fail');
            expect(calls).to.equal(3);
            done();
        });
    });

    it('should work as an embedded task', (done) => {
        var retryResult = 'RETRY';
        var fooResults;
        var retryResults;

        async.auto({
            dep: async.constant('dep'),
            foo: ['dep', function(results, callback){
                fooResults = results;
                callback(null, 'FOO');
            }],
            retry: ['dep', async.retryable((results, callback) => {
                retryResults = results;
                callback(null, retryResult);
            })]
        }, (err, results) => {
            assert.equal(results.retry, retryResult, "Incorrect result was returned from retry function");
            assert.equal(fooResults, retryResults, "Incorrect results were passed to retry function");
            done();
        });
    });

    it('should work as an embedded task with interval', (done) => {
        var start = new Date().getTime();
        var opts = {times: 5, interval: 20};

        async.auto({
            foo(callback){
                callback(null, 'FOO');
            },
            retry: async.retryable(opts, (callback) => {
                callback('err');
            })
        }, () => {
            var duration = new Date().getTime() - start;
            var expectedMinimumDuration = (opts.times -1) * opts.interval;
            assert(duration >= expectedMinimumDuration,
                "The duration should have been greater than " +
                expectedMinimumDuration + ", but was " + duration);
            done();
        });
    });

    it('should be cancelable', (done) => {
        var calls = 0;
        var retryableTask = async.retryable(3, (_, cb) => {
            calls++;
            cb(calls > 1 ? false : 'fail');
        });
        retryableTask('foo', () => {
            throw new Error('should not get here');
        })

        setTimeout(() => {
            expect(calls).to.equal(2);
            done();
        }, 25);
    });
});
