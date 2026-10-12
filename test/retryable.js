var async = require('../lib');
var {expect} = require('chai');
var assert = require('assert');

describe('retryable', () => {
    it('should return a Promise without data arguments', async () => {
        let calls = 0;
        const fn = async.retryable(3, cb => {
            calls++;
            cb(calls === 1 ? new Error('retry') : null, 42);
        });
        expect(await fn()).to.equal(42);
        expect(calls).to.equal(2);
    });

    it('should reject with the task error without data arguments', async () => {
        const error = new Error('failure');
        const fn = async.retryable(2, cb => cb(error));
        await fn().then(
            () => assert.fail('should reject'),
            err => expect(err).to.equal(error)
        );
    });

    [undefined, null].forEach(callback => {
        it(`should accept ${callback} as an omitted callback`, async () => {
            const fn = async.retryable((value, cb) => cb(null, value));
            expect(await fn('value', callback)).to.equal('value');
        });
    });

    it('should not pass a missing callback as data to an async task', async () => {
        const fn = async.retryable(async (...args) => args.length);
        expect(await fn()).to.equal(0);
    });

    it('should preserve an undefined data argument', async () => {
        const fn = async.retryable((value, cb) => {
            expect(value).to.equal(undefined);
            cb(null, 42);
        });
        expect(await fn(undefined)).to.equal(42);
    });

    it('should preserve callbacks without data arguments', done => {
        const fn = async.retryable(cb => async.setImmediate(() => cb(null, 42)));
        const result = fn((err, value) => {
            expect(err).to.equal(null);
            expect(value).to.equal(42);
            done();
        });
        expect(result).to.equal(undefined);
    });

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
