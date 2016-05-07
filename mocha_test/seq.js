var async = require('../lib');
var expect = require('chai').expect;
var assert = require('assert');

describe('seq', function() {

    it('seq', function(done) {
        var add2 = function (n, cb) {
            expect(n).to.equal(3);
            setTimeout(function () {
                cb(null, n + 2);
            }, 50);
        };
        var mul3 = function (n, cb) {
            expect(n).to.equal(5);
            setTimeout(function () {
                cb(null, n * 3);
            }, 15);
        };
        var add1 = function (n, cb) {
            expect(n).to.equal(15);
            setTimeout(function () {
                cb(null, n + 1);
            }, 100);
        };
        var add2mul3add1 = async.seq(add2, mul3, add1);
        add2mul3add1(3, function (err, result) {
            if (err) {
                return done(err);
            }
            assert(err === null, err + " passed instead of 'null'");
            expect(result).to.equal(16);
            done();
        });
    });

    it('seq error', function(done) {
        var testerr = new Error('test');

        var add2 = function (n, cb) {
            expect(n).to.equal(3);
            setTimeout(function () {
                cb(null, n + 2);
            }, 50);
        };
        var mul3 = function (n, cb) {
            expect(n).to.equal(5);
            setTimeout(function () {
                cb(testerr);
            }, 15);
        };
        var add1 = function (n, cb) {
            assert(false, 'add1 should not get called');
            setTimeout(function () {
                cb(null, n + 1);
            }, 100);
        };
        var add2mul3add1 = async.seq(add2, mul3, add1);
        add2mul3add1(3, function (err) {
            expect(err).to.equal(testerr);
            done();
        });
    });

    it('seq binding', function(done) {
        var testcontext = {name: 'foo'};

        var add2 = function (n, cb) {
            expect(this).to.equal(testcontext);
            setTimeout(function () {
                cb(null, n + 2);
            }, 50);
        };
        var mul3 = function (n, cb) {
            expect(this).to.equal(testcontext);
            setTimeout(function () {
                cb(null, n * 3);
            }, 15);
        };
        var add2mul3 = async.seq(add2, mul3);
        add2mul3.call(testcontext, 3, function (err, result) {
            if (err) {
                return done(err);
            }
            expect(this).to.equal(testcontext);
            expect(result).to.equal(15);
            done();
        });
    });

    it('seq without callback', function(done) {
        var testcontext = {name: 'foo'};

        var add2 = function (n, cb) {
            expect(this).to.equal(testcontext);
            setTimeout(function () {
                cb(null, n + 2);
            }, 50);
        };
        var mul3 = function () {
            expect(this).to.equal(testcontext);
            setTimeout(function () {
                done();
            }, 15);
        };
        var add2mul3 = async.seq(add2, mul3);
        add2mul3.call(testcontext, 3);
    });
});
