var async = require('../lib');
var expect = require('chai').expect;
var assert = require('assert');

describe('applyEach', function () {

    it('applyEach', function (done) {
        var call_order = [];
        var one = function (val, cb) {
            expect(val).to.equal(5);
            setTimeout(function () {
                call_order.push('one');
                cb(null, 1);
            }, 10);
        };
        var two = function (val, cb) {
            expect(val).to.equal(5);
            setTimeout(function () {
                call_order.push('two');
                cb(null, 2);
            }, 5);
        };
        var three = function (val, cb) {
            expect(val).to.equal(5);
            setTimeout(function () {
                call_order.push('three');
                cb(null, 3);
            }, 15);
        };
        async.applyEach([one, two, three], 5, function (err) {
            assert(err === null, err + " passed instead of 'null'");
            expect(call_order).to.eql(['two', 'one', 'three']);
            done();
        });
    });

    it('applyEachSeries', function (done) {
        var call_order = [];
        var one = function (val, cb) {
            expect(val).to.equal(5);
            setTimeout(function () {
                call_order.push('one');
                cb(null, 1);
            }, 10);
        };
        var two = function (val, cb) {
            expect(val).to.equal(5);
            setTimeout(function () {
                call_order.push('two');
                cb(null, 2);
            }, 5);
        };
        var three = function (val, cb) {
            expect(val).to.equal(5);
            setTimeout(function () {
                call_order.push('three');
                cb(null, 3);
            }, 15);
        };
        async.applyEachSeries([one, two, three], 5, function (err) {
            assert(err === null, err + " passed instead of 'null'");
            expect(call_order).to.eql(['one', 'two', 'three']);
            done();
        });
    });

    it('applyEach partial application', function (done) {
        var call_order = [];
        var one = function (val, cb) {
            expect(val).to.equal(5);
            setTimeout(function () {
                call_order.push('one');
                cb(null, 1);
            }, 10);
        };
        var two = function (val, cb) {
            expect(val).to.equal(5);
            setTimeout(function () {
                call_order.push('two');
                cb(null, 2);
            }, 5);
        };
        var three = function (val, cb) {
            expect(val).to.equal(5);
            setTimeout(function () {
                call_order.push('three');
                cb(null, 3);
            }, 15);
        };
        async.applyEach([one, two, three])(5, function (err) {
            if (err) throw err;
            expect(call_order).to.eql(['two', 'one', 'three']);
            done();
        });
    });
});
