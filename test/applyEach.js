var async = require('../lib');
var {expect} = require('chai');
var assert = require('assert');

describe('applyEach', () => {

    it('applyEach', (done) => {
        var call_order = [];
        var one = function (val, cb) {
            call_order.push(val)
            setTimeout(() => {
                call_order.push('done');
                cb(null, 1);
            }, 1);
        };
        var two = function (val, cb) {
            call_order.push(val)
            setTimeout(() => {
                call_order.push('done');
                cb(null, 2);
            }, 2);
        };
        var three = function (val, cb) {
            call_order.push(val)
            setTimeout(() => {
                call_order.push('done');
                cb(null, 3);
            }, 2);
        };
        async.applyEach([one, two, three], 5)((err, results) => {
            assert(err === null, err + " passed instead of 'null'");
            expect(call_order).to.eql([5, 5, 5, 'done', 'done', 'done']);
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

        async.applyEach({one, two, three}, 5)(() => {
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
            call_order.push(val)
            setTimeout(() => {
                call_order.push('done');
                cb(null, 1);
            }, 1);
        }
        function two(val, cb) {
            call_order.push(val)
            setTimeout(() => {
                call_order.push('done');
                cb(null, 2);
            }, 5);
        }
        function three(val, cb) {
            call_order.push(val)
            setTimeout(() => {
                call_order.push('done');
                cb(null, 3);
            }, 1);
        }
        async.applyEachSeries([one, two, three], 5)((err, results) => {
            assert(err === null, err + " passed instead of 'null'");
            expect(call_order).to.eql([5, 'done', 5, 'done', 5, 'done']);
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
        async.applyEachSeries([one, two, three], 5)(() => {
            throw new Error('final callback - should not get here');
        });

        setTimeout(() => {
            expect(call_order).to.eql(['one', 'two']);
            done();
        }, 25);
    });
});
