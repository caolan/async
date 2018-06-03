var async = require('../lib');
var expect = require('chai').expect;
var _ = require('lodash');

describe("detect", function () {

    function detectIteratee(call_order, x, callback) {
        setTimeout(function(){
            call_order.push(x);
            callback(null, x == 2);
        }, x*5);
    }

    it('detect', function(done){
        var call_order = [];
        async.detect([3,2,1], detectIteratee.bind(this, call_order), function(err, result){
            call_order.push('callback');
            expect(err).to.equal(null);
            expect(result).to.equal(2);
        });
        setTimeout(function(){
            expect(call_order).to.eql([1,2,'callback',3]);
            done();
        }, 25);
    });

    it('detect - mulitple matches', function(done){
        var call_order = [];
        async.detect([3,2,2,1,2], detectIteratee.bind(this, call_order), function(err, result){
            call_order.push('callback');
            expect(err).to.equal(null);
            expect(result).to.equal(2);
        });
        setTimeout(function(){
            expect(call_order).to.eql([1,2,'callback',2,2,3]);
            done();
        }, 25);
    });

    it('detect error', function(done){
        async.detect([3,2,1], function(x, callback) {
            setTimeout(function(){callback('error');}, 0);
        }, function(err, result){
            expect(err).to.equal('error');
            expect(result).to.not.exist;
            done();
        });
    });

    it('detectSeries', function(done){
        var call_order = [];
        async.detectSeries([3,2,1], detectIteratee.bind(this, call_order), function(err, result){
            call_order.push('callback');
            expect(err).to.equal(null);
            expect(result).to.equal(2);
        });
        setTimeout(function(){
            expect(call_order).to.eql([3,2,'callback']);
            done();
        }, 50);
    });

    it('detectSeries - multiple matches', function(done){
        var call_order = [];
        async.detectSeries([3,2,2,1,2], detectIteratee.bind(this, call_order), function(err, result){
            call_order.push('callback');
            expect(err).to.equal(null);
            expect(result).to.equal(2);
        });
        setTimeout(function(){
            expect(call_order).to.eql([3,2,'callback']);
            done();
        }, 50);
    });

    it('detect no callback', function(done) {
        var calls = [];

        async.detect([1, 2, 3], function (val, cb) {
            calls.push(val);
            cb();
        });

        setTimeout(function () {
            expect(calls).to.eql([1, 2, 3]);
            done();
        }, 10);
    });

    it('detectSeries - ensure stop', function (done) {
        async.detectSeries([1, 2, 3, 4, 5], function (num, cb) {
            if (num > 3) throw new Error("detectSeries did not stop iterating");
            cb(null, num === 3);
        }, function (err, result) {
            expect(err).to.equal(null);
            expect(result).to.equal(3);
            done();
        });
    });

    it('detectLimit', function(done){
        var call_order = [];
        async.detectLimit([3, 2, 1], 2, detectIteratee.bind(this, call_order), function(err, result) {
            call_order.push('callback');
            expect(err).to.equal(null);
            expect(result).to.equal(2);
        });
        setTimeout(function() {
            expect(call_order).to.eql([2, 'callback', 3]);
            done();
        }, 50);
    });

    it('detectLimit - multiple matches', function(done){
        var call_order = [];
        async.detectLimit([3,2,2,1,2], 2, detectIteratee.bind(this, call_order), function(err, result){
            call_order.push('callback');
            expect(err).to.equal(null);
            expect(result).to.equal(2);
        });
        setTimeout(function(){
            expect(call_order).to.eql([2, 'callback', 3]);
            done();
        }, 50);
    });

    it('detectLimit - ensure stop', function (done) {
        async.detectLimit([1, 2, 3, 4, 5], 2, function (num, cb) {
            if (num > 4) throw new Error("detectLimit did not stop iterating");
            cb(null, num === 3);
        }, function (err, result) {
            expect(err).to.equal(null);
            expect(result).to.equal(3);
            done();
        });
    });

    it('detectSeries doesn\'t cause stack overflow (#1293)', function(done) {
        var arr = _.range(10000);
        let calls = 0;
        async.detectSeries(arr, function(data, cb) {
            calls += 1;
            async.setImmediate(_.partial(cb, null, true));
        }, function(err) {
            expect(err).to.equal(null);
            expect(calls).to.equal(1);
            done();
        });
    });

    it('detectLimit doesn\'t cause stack overflow (#1293)', function(done) {
        var arr = _.range(10000);
        let calls = 0;
        async.detectLimit(arr, 100, function(data, cb) {
            calls += 1;
            async.setImmediate(_.partial(cb, null, true));
        }, function(err) {
            expect(err).to.equal(null);
            expect(calls).to.equal(100);
            done();
        });
    });

    it('find alias', function(){
        expect(async.find).to.equal(async.detect);
    });

    it('findLimit alias', function(){
        expect(async.findLimit).to.equal(async.detectLimit);
    });

    it('findSeries alias', function(){
        expect(async.findSeries).to.be.a('function');
        expect(async.findSeries).to.equal(async.detectSeries);
    });

});
