var async = require('../lib/async');
var assert = require('assert');

describe('race', function () {
    it('should call each function in parallel and callback with first result', function (done) {
        var finished = 0;
        var tasks = [];
        for (var i = 0; i < 10; i++) {
            tasks[i] = (function () {
                var index = i;
                return function (next) {
                    finished++;
                    next(null, index);
                }
            })();
        }
        async.race(tasks, function (err, result) {
            assert.ifError(err);
            //0 finished first
            assert.strictEqual(result, 0);
            assert.strictEqual(finished, 1);
            async.setImmediate(function () {
                assert.strictEqual(finished, 10);
                done();
            });
        });
    });
    it('should callback with the first error', function (done) {
        var tasks = [];
        for (var i = 0; i <= 5; i++) {
            tasks[i] = (function () {
                var index = i;
                return function (next) {
                    setTimeout(function () {
                        next(new Error('ERR' + index));
                    }, 50 - index * 2);
                }
            })();
        }
        async.race(tasks, function (err, result) {
            assert.ok(err);
            assert.ok(err instanceof Error);
            assert.strictEqual(typeof result, 'undefined');
            assert.strictEqual(err.message, 'ERR5');
            done();
        });
    });
    it('should callback when task is empty', function (done) {
        async.race([], function (err, result) {
            assert.strictEqual(err, null);
            assert.strictEqual(typeof result, 'undefined');
            done();
        });
    });
    it('should callback in error the task arg is not an Array', function () {
        var errors = [];
        async.race(null, function (err) {
            errors.push(err);
        });
        async.race({}, function (err) {
            errors.push(err);
        });
        assert.strictEqual(errors.length, 2);
        assert.ok(errors[0] instanceof TypeError);
        assert.ok(errors[1] instanceof TypeError);
    });
});
