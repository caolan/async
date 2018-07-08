var async = require('../lib');
var expect = require('chai').expect;
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

    it('applyEachSeries', (done) => {
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
        async.applyEachSeries([one, two, three], 5, (err, results) => {
            assert(err === null, err + " passed instead of 'null'");
            expect(call_order).to.eql(['one', 'two', 'three']);
            expect(results).to.eql([1, 2, 3]);
            done();
        });
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
