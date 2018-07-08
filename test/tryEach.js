var async = require('../lib');
var expect = require('chai').expect;
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
});

