var async = require('../lib');
var {expect} = require('chai');
var assert = require('assert');

describe('applyEach', () => {

    it('applyEach', (done) => {
        var call_order = [];
        var one = function (val, cb) {
            expect(val).to.equal(5);
            setTimeout(() => {
                call_order.push('one');
                cb(null, 1);
            }, 12);
        };
        var two = function (val, cb) {
            expect(val).to.equal(5);
            setTimeout(() => {
                call_order.push('two');
                cb(null, 2);
            }, 2);
        };
        var three = function (val, cb) {
            expect(val).to.equal(5);
            setTimeout(() => {
                call_order.push('three');
                cb(null, 3);
            }, 18);
        };
        async.applyEach([one, two, three], 5, (err, results) => {
            assert(err === null, err + " passed instead of 'null'");
            expect(call_order).to.eql(['two', 'one', 'three']);
            expect(results).to.eql([1, 2, 3]);
            done();
        });
    });

    it('applyEach canceled', (done) => {
        var call_order = [];
        function one(_, cb) {
            call_order.push('one');
            cb(null, 1);
        }

        function two(_, cb) {
            call_order.push('two');
            cb(false);
        }

        function three(/*, cb */) {
            throw new Error('third task - should not get here');
        }

        async.applyEach({one, two, three}, 5, () => {
            throw new Error('final callback - should not get here');
        });

        setTimeout(() => {
            expect(call_order).to.eql(['one', 'two']);
            done();
        }, 25);
    });

    it('applyEachSeries', (done) => {
        var call_order = [];
        function one(val, cb) {
            expect(val).to.equal(5);
            setTimeout(() => {
                call_order.push('one');
                cb(null, 1);
            }, 10);
        }
        function two(val, cb) {
            expect(val).to.equal(5);
            setTimeout(() => {
                call_order.push('two');
                cb(null, 2);
            }, 5);
        }
        function three(val, cb) {
            expect(val).to.equal(5);
            setTimeout(() => {
                call_order.push('three');
                cb(null, 3);
            }, 15);
        }
        async.applyEachSeries([one, two, three], 5, (err, results) => {
            assert(err === null, err + " passed instead of 'null'");
            expect(call_order).to.eql(['one', 'two', 'three']);
            expect(results).to.eql([1, 2, 3]);
            done();
        });
    });

    it('applyEachSeries canceled', (done) => {
        var call_order = [];
        function one(_, cb) {
            async.setImmediate(() => {
                call_order.push('one');
                cb(null, 1);
            });
        }
        function two(_, cb) {
            async.setImmediate(() => {
                call_order.push('two');
                cb(false);
            });
        }
        function three(/*, cb */) {
            throw new Error('third task - should not get here');
        }
        async.applyEachSeries([one, two, three], 5, () => {
            throw new Error('final callback - should not get here');
        });

        setTimeout(() => {
            expect(call_order).to.eql(['one', 'two']);
            done();
        }, 25);
    });

    it('applyEach partial application', (done) => {
        var call_order = [];
        var one = function (val, cb) {
            expect(val).to.equal(5);
            setTimeout(() => {
                call_order.push('one');
                cb(null, 1);
            }, 10);
        };
        var two = function (val, cb) {
            expect(val).to.equal(5);
            setTimeout(() => {
                call_order.push('two');
                cb(null, 2);
            }, 5);
        };
        var three = function (val, cb) {
            expect(val).to.equal(5);
            setTimeout(() => {
                call_order.push('three');
                cb(null, 3);
            }, 15);
        };
        async.applyEach([one, two, three])(5, (err, results) => {
            if (err) throw err;
            expect(call_order).to.eql(['two', 'one', 'three']);
            expect(results).to.eql([1, 2, 3]);
            done();
        });
    });
});
