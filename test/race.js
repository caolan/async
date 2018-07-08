var async = require('../lib');
var assert = require('assert');

describe('race', () => {
    it('should call each function in parallel and callback with first result', (done) => {
        var finished = 0;
        var tasks = [];
        function eachTest(i) {
            var index = i;
            return function (next) {
                finished++;
                next(null, index);
            };
        }
        for (var i = 0; i < 10; i++) {
            tasks[i] = eachTest(i);
        }
        async.race(tasks, (err, result) => {
            assert.ifError(err);
            //0 finished first
            assert.strictEqual(result, 0);
            assert.strictEqual(finished, 1);
            async.setImmediate(() => {
                assert.strictEqual(finished, 10);
                done();
            });
        });
    });
    it('should callback with the first error', (done) => {
        var tasks = [];
        function eachTest(i) {
            var index = i;
            return function (next) {
                setTimeout(() => {
                    next(new Error('ERR' + index));
                }, 50 - index * 2);
            };
        }
        for (var i = 0; i <= 5; i++) {
            tasks[i] = eachTest(i);
        }
        async.race(tasks, (err, result) => {
            assert.ok(err);
            assert.ok(err instanceof Error);
            assert.strictEqual(typeof result, 'undefined');
            assert.strictEqual(err.message, 'ERR5');
            done();
        });
    });
    it('should callback when task is empty', (done) => {
        async.race([], (err, result) => {
            assert.ifError(err);
            assert.strictEqual(typeof result, 'undefined');
            done();
        });
    });
    it('should callback in error the task arg is not an Array', () => {
        var errors = [];
        async.race(null, (err) => {
            errors.push(err);
        });
        async.race({}, (err) => {
            errors.push(err);
        });
        assert.strictEqual(errors.length, 2);
        assert.ok(errors[0] instanceof TypeError);
        assert.ok(errors[1] instanceof TypeError);
    });
});

