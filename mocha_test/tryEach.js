var async = require('../lib');
var expect = require('chai').expect;
var assert = require('assert');

describe('tryEach', function () {
    it('no callback', function () {
        async.tryEach([]);
    });
    it('empty', function (done) {
        async.tryEach([], function (err, results) {
            expect(err).to.equal(null);
            expect(results).to.eql(undefined);
            done();
        });
    });
    it('one task, multiple results', function (done) {
        var RESULTS = ['something', 'something2'];
        async.tryEach([
            function (callback) {
                callback(null, RESULTS[0], RESULTS[1]);
            }
        ], function (err, results) {
            expect(err).to.equal(null);
            expect(results).to.eql(RESULTS);
            done();
        });
    });
    it('one task', function (done) {
        var RESULT = 'something';
        async.tryEach([
            function (callback) {
                callback(null, RESULT);
            }
        ], function (err, results) {
            expect(err).to.equal(null);
            expect(results).to.eql(RESULT);
            done();
        });
    });
    it('two tasks, one failing', function (done) {
        var RESULT = 'something';
        async.tryEach([
            function (callback) {
                callback(new Error('Failure'), {});
            },
            function (callback) {
                callback(null, RESULT);
            }
        ], function (err, results) {
            expect(err).to.equal(null);
            expect(results).to.eql(RESULT);
            done();
        });
    });
    it('two tasks, both failing', function (done) {
        var ERROR_RESULT = new Error('Failure2');
        async.tryEach([
            function (callback) {
                callback(new Error('Should not stop here'));
            },
            function (callback) {
                callback(ERROR_RESULT);
            }
        ], function (err, results) {
            expect(err).to.equal(ERROR_RESULT);
            expect(results).to.eql(undefined);
            done();
        });
    });
    it('two tasks, non failing', function (done) {
        var RESULT = 'something';
        async.tryEach([
            function (callback) {
                callback(null, RESULT);
            },
            function () {
                assert.fail('Should not been called');
            },
        ], function (err, results) {
            expect(err).to.equal(null);
            expect(results).to.eql(RESULT);
            done();
        });
    });
});

