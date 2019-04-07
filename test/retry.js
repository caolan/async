var async = require('../lib');
var {expect} = require('chai');
var assert = require('assert');
var _ = require('lodash');

describe("retry", () => {

    // Issue 306 on github: https://github.com/caolan/async/issues/306
    it('retry when attempt succeeds',(done) => {
        var failed = 3;
        var callCount = 0;
        var expectedResult = 'success';
        function fn(callback) {
            callCount++;
            failed--;
            if (!failed) callback(null, expectedResult);
            else callback(true); // respond with error
        }
        async.retry(fn, (err, result) => {
            assert(err === null, err + " passed instead of 'null'");
            assert.equal(callCount, 3, 'did not retry the correct number of times');
            assert.equal(result, expectedResult, 'did not return the expected result');
            done();
        });
    });

    it('retry when all attempts fail',(done) => {
        var times = 3;
        var callCount = 0;
        var error = 'ERROR';
        var erroredResult = 'RESULT';
        function fn(callback) {
            callCount++;
            callback(error + callCount, erroredResult + callCount); // respond with indexed values
        }
        async.retry(times, fn, (err, result) => {
            assert.equal(callCount, 3, "did not retry the correct number of times");
            assert.equal(err, error + times, "Incorrect error was returned");
            assert.equal(result, erroredResult + times, "Incorrect result was returned");
            done();
        });
    });

    it('retry fails with invalid arguments',(done) => {
        expect(() => {
            async.retry("");
        }).to.throw();
        expect(() => {
            async.retry();
        }).to.throw();
        expect(() => {
            async.retry(() => {}, 2, () => {});
        }).to.throw();
        done();
    });

    it('retry with interval when all attempts fail',function(done) {
        this.retries(3); // this test is flakey due to timing issues

        var times = 3;
        var interval = 50;
        var callCount = 0;
        var error = 'ERROR';
        var erroredResult = 'RESULT';
        function fn(callback) {
            callCount++;
            callback(error + callCount, erroredResult + callCount); // respond with indexed values
        }
        var start = Date.now();
        async.retry({ times, interval}, fn, (err, result) => {
            var duration = Date.now() - start;
            expect(duration).to.be.above(interval * (times - 1) - times);
            assert.equal(callCount, 3, "did not retry the correct number of times");
            assert.equal(err, error + times, "Incorrect error was returned");
            assert.equal(result, erroredResult + times, "Incorrect result was returned");
            done();
        });
    });

    it('retry with custom interval when all attempts fail',(done) => {
        var times = 3;
        var retryCounts = []
        var intervalFunc = function(retryCount) {
            retryCounts.push(retryCount)
            return retryCount * 100;
        };
        var callCount = 0;
        var error = 'ERROR';
        var erroredResult = 'RESULT';
        function fn(callback) {
            callCount++;
            callback(error + callCount, erroredResult + callCount); // respond with indexed values
        }
        var start = Date.now();
        async.retry({ times, interval: intervalFunc}, fn, (err, result) => {
            var duration = Date.now() - start;
            expect(duration).to.be.above(300 - times);
            assert.equal(callCount, 3, "did not retry the correct number of times");
            assert.equal(err, error + times, "Incorrect error was returned");
            assert.equal(result, erroredResult + times, "Incorrect result was returned");
            assert.deepEqual(retryCounts, [1, 2])
            done();
        });
    });

    it("should not require a callback", (done) => {
        var called = false;
        async.retry(3, (cb) => {
            called = true;
            cb();
        });
        setTimeout(() => {
            assert(called);
            done();
        }, 10);
    });

    it("should not require a callback and use the default times", (done) => {
        var calls = 0;
        async.retry((cb) => {
            calls++;
            cb("fail");
        }).catch(() => {});
        setTimeout(() => {
            expect(calls).to.equal(5);
            done();
        }, 100);
    });

    it("should be cancelable", (done) => {
        var calls = 0;
        async.retry(2, (cb) => {
            calls++;
            cb(calls > 1 ? false : 'fail');
        }, () => { throw new Error('should not get here') });
        setTimeout(() => {
            expect(calls).to.equal(2);
            done();
        }, 10);
    });

    it('retry does not precompute the intervals (#1226)', (done) => {
        var callTimes = [];
        function intervalFunc() {
            callTimes.push(Date.now());
            return 100;
        }
        function fn(callback) {
            callback({}); // respond with indexed values
        }
        async.retry({ times: 4, interval: intervalFunc}, fn, () => {
            expect(callTimes[1] - callTimes[0]).to.be.above(90);
            expect(callTimes[2] - callTimes[1]).to.be.above(90);
            done();
        });
    });

    it('retry passes all resolve arguments to callback', (done) => {
        function fn(callback) {
            callback(null, 1, 2, 3); // respond with indexed values
        }
        async.retry(5, fn, _.rest((args) => {
            expect(args).to.be.eql([null, 1, 2, 3]);
            done();
        }));
    });

    // note this is a synchronous test ensuring retry is synchrnous in the fastest (most straightforward) case
    it('retry calls fn immediately and will call callback if successful', () => {
        function fn(callback) {
            callback(null, {a: 1});
        }
        async.retry(5, fn, (err, result) => {
            expect(result).to.be.eql({a: 1});
        });
    });

    it('retry when all attempts fail and error continue test returns true',(done) => {
        var times = 3;
        var callCount = 0;
        var error = 'ERROR';
        var special = 'SPECIAL_ERROR';
        var erroredResult = 'RESULT';
        function fn(callback) {
            callCount++;
            callback(error + callCount, erroredResult + callCount);
        }
        function errorTest(err) {
            return err && err !== special;
        }
        var options = {
            times,
            errorFilter: errorTest
        };
        async.retry(options, fn, (err, result) => {
            assert.equal(callCount, 3, "did not retry the correct number of times");
            assert.equal(err, error + times, "Incorrect error was returned");
            assert.equal(result, erroredResult + times, "Incorrect result was returned");
            done();
        });
    });

    it('retry when some attempts fail and error test returns false at some invokation',(done) => {
        var callCount = 0;
        var error = 'ERROR';
        var special = 'SPECIAL_ERROR';
        var erroredResult = 'RESULT';
        function fn(callback) {
            callCount++;
            var err = callCount === 2 ? special : error + callCount;
            callback(err, erroredResult + callCount);
        }
        function errorTest(err) {
            return err && err === error + callCount; // just a different pattern
        }
        var options = {
            errorFilter: errorTest
        };
        async.retry(options, fn, (err, result) => {
            assert.equal(callCount, 2, "did not retry the correct number of times");
            assert.equal(err, special, "Incorrect error was returned");
            assert.equal(result, erroredResult + 2, "Incorrect result was returned");
            done();
        });
    });

    it('retry with interval when some attempts fail and error test returns false at some invokation',function(done) {
        this.retries(3); // flakey test

        var interval = 50;
        var callCount = 0;
        var error = 'ERROR';
        var erroredResult = 'RESULT';
        var special = 'SPECIAL_ERROR';
        var specialCount = 3;
        function fn(callback) {
            callCount++;
            var err = callCount === specialCount ? special : error + callCount;
            callback(err, erroredResult + callCount);
        }
        function errorTest(err) {
            return err && err !== special;
        }
        var start = Date.now();
        async.retry({ interval, errorFilter: errorTest }, fn, (err, result) => {
            var duration = Date.now() - start;
            expect(duration).to.be.above(interval * (specialCount - 1) - specialCount);
            assert.equal(callCount, specialCount, "did not retry the correct number of times");
            assert.equal(err, special, "Incorrect error was returned");
            assert.equal(result, erroredResult + specialCount, "Incorrect result was returned");
            done();
        });
    });

    it('retry when first attempt succeeds and error test should not be called',(done) => {
        var callCount = 0;
        var error = 'ERROR';
        var erroredResult = 'RESULT';
        var continueTestCalled = false;
        function fn(callback) {
            callCount++;
            callback(null, erroredResult + callCount);
        }
        function errorTest(err) {
            continueTestCalled = true;
            return err && err === error;
        }
        var options = {
            errorFilter: errorTest
        };
        async.retry(options, fn, _.rest((args) => {
            assert.equal(callCount, 1, "did not retry the correct number of times");
            expect(args).to.be.eql([null, erroredResult + callCount]);
            assert.equal(continueTestCalled, false, "error test function was called");
            done();
        }));
    });
});
