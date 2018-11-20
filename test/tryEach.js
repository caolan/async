var async = require('../lib');
var {expect} = require('chai');
var assert = require('assert');

describe('tryEach', () => {
    it('no callback', () => {
        async.tryEach([]);
    });
    it('empty', (done) => {
        async.tryEach([], (err, results) => {
            expect(err).to.equal(null);
            expect(results).to.eql(undefined);
            done();
        });
    });
    it('one task, multiple results', (done) => {
        var RESULTS = ['something', 'something2'];
        async.tryEach([
            function (callback) {
                callback(null, RESULTS[0], RESULTS[1]);
            }
        ], (err, results) => {
            expect(err).to.equal(null);
            expect(results).to.eql(RESULTS);
            done();
        });
    });
    it('one task', (done) => {
        var RESULT = 'something';
        async.tryEach([
            function (callback) {
                callback(null, RESULT);
            }
        ], (err, results) => {
            expect(err).to.equal(null);
            expect(results).to.eql(RESULT);
            done();
        });
    });
    it('two tasks, one failing', (done) => {
        var RESULT = 'something';
        async.tryEach([
            function (callback) {
                callback(new Error('Failure'), {});
            },
            function (callback) {
                callback(null, RESULT);
            }
        ], (err, results) => {
            expect(err).to.equal(null);
            expect(results).to.eql(RESULT);
            done();
        });
    });
    it('two tasks, both failing', (done) => {
        var ERROR_RESULT = new Error('Failure2');
        async.tryEach([
            function (callback) {
                callback(new Error('Should not stop here'));
            },
            function (callback) {
                callback(ERROR_RESULT);
            }
        ], (err, results) => {
            expect(err).to.equal(ERROR_RESULT);
            expect(results).to.eql(undefined);
            done();
        });
    });
    it('two tasks, non failing', (done) => {
        var RESULT = 'something';
        async.tryEach([
            function (callback) {
                callback(null, RESULT);
            },
            function () {
                assert.fail('Should not been called');
            },
        ], (err, results) => {
            expect(err).to.equal(null);
            expect(results).to.eql(RESULT);
            done();
        });
    });
    it('canceled', (done) => {
        var call_order = [];
        async.tryEach([
            function(callback) {
                call_order.push('task1');
                callback(false);
            },
            function() {
                assert.fail('task2 should not been called');
            }
        ], () => {
            assert.fail('should not been called');
        });

        setTimeout(() => {
            expect(call_order).to.eql(['task1']);
            done();
        }, 25);
    });
});
