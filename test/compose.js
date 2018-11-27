var async = require('../lib');
var {expect} = require('chai');

describe('compose', () => {
    context('all functions succeed', () => {
        it('yields the result of the composition of the functions', (done) => {
            var add2 = function (n, cb) {
                setTimeout(() => {
                    cb(null, n + 2);
                });
            };
            var mul3 = function (n, cb) {
                setTimeout(() => {
                    cb(null, n * 3);
                });
            };
            var add1 = function (n, cb) {
                setTimeout(() => {
                    cb(null, n + 1);
                });
            };
            var add2mul3add1 = async.compose(add1, mul3, add2);
            add2mul3add1(3, (err, result) => {
                expect(err).to.not.exist;
                expect(result).to.eql(16);
                done();
            });
        });
    });

    context('a function errors', () => {
        it('yields the error and does not call later functions', (done) => {
            var add1called = false;
            var mul3error = new Error('mul3 error');
            var add2 = function (n, cb) {
                setTimeout(() => {
                    cb(null, n + 2);
                });
            };
            var mul3 = function (n, cb) {
                setTimeout(() => {
                    cb(mul3error);
                });
            };
            var add1 = function (n, cb) {
                add1called = true;
                setTimeout(() => {
                    cb(null, n + 1);
                });
            };
            var add2mul3add1 = async.compose(add1, mul3, add2);
            add2mul3add1(3, (err, result) => {
                expect(err).to.eql(mul3error);
                expect(result).to.not.exist;
                expect(add1called).to.be.false;
                done();
            });
        });
    });

    it('calls each function with the binding of the composed function', (done) => {
        var context = {};
        var add2Context = null;
        var mul3Context = null;
        var add2 = function (n, cb) {
            add2Context = this;
            setTimeout(() => {
                cb(null, n + 2);
            });
        };
        var mul3 = function (n, cb) {
            mul3Context = this;
            setTimeout(() => {
                cb(null, n * 3);
            });
        };
        var add2mul3 = async.compose(mul3, add2);
        add2mul3.call(context, 3, (err, result) => {
            expect(err).to.not.exist;
            expect(result).to.eql(15);
            expect(add2Context).to.equal(context);
            expect(mul3Context).to.equal(context);
            done();
        });
    });

    it('should be cancelable', (done) => {
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
        var add2mul3add1 = async.compose(add1, mul3, add2);
        add2mul3add1(3, () => {
            throw new Error('final callback - should not get here');
        });

        setTimeout(() => {
            expect(call_order).to.eql(['add2', 'mul3']);
            done();
        }, 25);
    });
});
