var async = require('../lib');
var {expect} = require('chai');
var assert = require('assert');

describe('seq', () => {

    it('seq', (done) => {
        var add2 = function (n, cb) {
            expect(n).to.equal(3);
            setTimeout(() => {
                cb(null, n + 2);
            }, 50);
        };
        var mul3 = function (n, cb) {
            expect(n).to.equal(5);
            setTimeout(() => {
                cb(null, n * 3);
            }, 15);
        };
        var add1 = function (n, cb) {
            expect(n).to.equal(15);
            setTimeout(() => {
                cb(null, n + 1);
            }, 100);
        };
        var add2mul3add1 = async.seq(add2, mul3, add1);
        add2mul3add1(3, (err, result) => {
            if (err) {
                return done(err);
            }
            assert(err === null, err + " passed instead of 'null'");
            expect(result).to.equal(16);
            done();
        });
    });

    it('seq error', (done) => {
        var testerr = new Error('test');

        var add2 = function (n, cb) {
            expect(n).to.equal(3);
            setTimeout(() => {
                cb(null, n + 2);
            }, 50);
        };
        var mul3 = function (n, cb) {
            expect(n).to.equal(5);
            setTimeout(() => {
                cb(testerr);
            }, 15);
        };
        var add1 = function (n, cb) {
            assert(false, 'add1 should not get called');
            setTimeout(() => {
                cb(null, n + 1);
            }, 100);
        };
        var add2mul3add1 = async.seq(add2, mul3, add1);
        add2mul3add1(3, (err) => {
            expect(err).to.equal(testerr);
            done();
        });
    });

    it('seq canceled', (done) => {
        var call_order = [];

        var add2 = function (n, cb) {
            call_order.push('add2');
            cb(null, n + 2);
        };
        var mul3 = function (n, cb) {
            call_order.push('mul3');
            cb(false, n * 3);
        };
        var add1 = function () {
            throw new Error('add1 - should not get here');
        };
        var add2mul3add1 = async.seq(add2, mul3, add1);
        add2mul3add1(3, () => {
            throw new Error('final callback - should not get here');
        });

        setTimeout(() => {
            expect(call_order).to.eql(['add2', 'mul3']);
            done();
        }, 25);
    });

    it('seq binding', (done) => {
        var testcontext = {name: 'foo'};

        var add2 = function (n, cb) {
            expect(this).to.equal(testcontext);
            setTimeout(() => {
                cb(null, n + 2);
            }, 50);
        };
        var mul3 = function (n, cb) {
            expect(this).to.equal(testcontext);
            setTimeout(() => {
                cb(null, n * 3);
            }, 15);
        };
        var add2mul3 = async.seq(add2, mul3);
        add2mul3.call(testcontext, 3, (err, result) => {
            if (err) {
                return done(err);
            }
            expect(result).to.equal(15);
            done();
        });
    });

    it('seq without callback', (done) => {
        var testcontext = {name: 'foo'};

        var add2 = function (n, cb) {
            expect(this).to.equal(testcontext);
            setTimeout(() => {
                cb(null, n + 2);
            }, 50);
        };
        var mul3 = function () {
            expect(this).to.equal(testcontext);
            setTimeout(() => {
                done();
            }, 15);
        };
        var add2mul3 = async.seq(add2, mul3);
        add2mul3.call(testcontext, 3);
    });
});
