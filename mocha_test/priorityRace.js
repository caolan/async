var async = require('../lib');
var expect = require('chai').expect;
var assert = require('assert');

describe('priorityRace', function () {
    it('should call each function in parallel and finish when one prioritized task is done', function priorityRaceTest10(done) {
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
        tasks[4].isPrioritized = true
        async.priorityRace(tasks, function (err, result) {
            assert.ifError(err);
            //race ended when 5 finished first
            expect(result).to.eql([0, 1, 2, 3, 4]);
            assert.strictEqual(finished, 5);
            done();
        });
    });
    it('should call each function in parallel and finish when all prioritized tasks are done', function priorityRaceTest20(done) {
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
        tasks[0].isPrioritized = true;
        tasks[7].isPrioritized = true;
        async.priorityRace(tasks, function (err, result) {
            assert.ifError(err);
            //race ended when both 0 and 7 finished
            expect(result).to.eql([0, 1, 2, 3, 4, 5, 6, 7]);
            assert.strictEqual(finished, 8);
            done();
        });
    });
    it('should callback with the first error', function priorityRaceTest30(done) {
        var tasks = [];
        function eachTest(i) {
            var index = i;
            return function (next) {
                setTimeout(function () {
                    next(new Error('ERR' + index));
                }, 50 - index * 2);
            };
        }
        for (var i = 0; i <= 5; i++) {
            tasks[i] = eachTest(i);
            tasks[0].priority = true;
        }
        async.priorityRace(tasks, function (err, result) {
            assert.ok(err);
            assert.ok(err instanceof Error);
            assert.strictEqual(typeof result, 'undefined');
            assert.strictEqual(err.message, 'ERR5');
            done();
        });
    });
    it('should callback when task is empty', function priorityRaceTest40(done) {
        async.priorityRace([], function (err, result) {
            assert.ifError(err);
            assert.strictEqual(typeof result, 'undefined');
            done();
        });
    });
    it('should callback in error when the task arg is not an Array', function priorityRaceTest50() {
        var errors = [];
        async.priorityRace(null, function (err) {
            errors.push(err);
        });
        async.priorityRace({}, function (err) {
            errors.push(err);
        });
        assert.strictEqual(errors.length, 2);
        assert.ok(errors[0] instanceof TypeError);
        assert.ok(errors[1] instanceof TypeError);
    });
});
