var async = require('../lib');
var expect = require('chai').expect;

describe("detect", function () {

    function detectIterator(call_order, x, callback) {
        setTimeout(function(){
            call_order.push(x);
            callback(null, x == 2);
        }, x*25);
    }

    it('detect', function(done){
        var call_order = [];
        async.detect([3,2,1], detectIterator.bind(this, call_order), function(err, result){
            call_order.push('callback');
            expect(err).to.equal(null);
            expect(result).to.equal(2);
        });
        setTimeout(function(){
            expect(call_order).to.eql([1,2,'callback',3]);
            done();
        }, 100);
    });

    it('detect - mulitple matches', function(done){
        var call_order = [];
        async.detect([3,2,2,1,2], detectIterator.bind(this, call_order), function(err, result){
            call_order.push('callback');
            expect(err).to.equal(null);
            expect(result).to.equal(2);
        });
        setTimeout(function(){
            expect(call_order).to.eql([1,2,'callback',2,2,3]);
            done();
        }, 100);
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
        async.detectSeries([3,2,1], detectIterator.bind(this, call_order), function(err, result){
            call_order.push('callback');
            expect(err).to.equal(null);
            expect(result).to.equal(2);
        });
        setTimeout(function(){
            expect(call_order).to.eql([3,2,'callback']);
            done();
        }, 200);
    });

    it('detectSeries - multiple matches', function(done){
        var call_order = [];
        async.detectSeries([3,2,2,1,2], detectIterator.bind(this, call_order), function(err, result){
            call_order.push('callback');
            expect(err).to.equal(null);
            expect(result).to.equal(2);
        });
        setTimeout(function(){
            expect(call_order).to.eql([3,2,'callback']);
            done();
        }, 200);
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
        async.detectLimit([3, 2, 1], 2, detectIterator.bind(this, call_order), function(err, result) {
            call_order.push('callback');
            expect(err).to.equal(null);
            expect(result).to.equal(2);
        });
        setTimeout(function() {
            expect(call_order).to.eql([2, 'callback', 3]);
            done();
        }, 100);
    });

    it('detectLimit - multiple matches', function(done){
        var call_order = [];
        async.detectLimit([3,2,2,1,2], 2, detectIterator.bind(this, call_order), function(err, result){
            call_order.push('callback');
            expect(err).to.equal(null);
            expect(result).to.equal(2);
        });
        setTimeout(function(){
            expect(call_order).to.eql([2, 'callback', 3]);
            done();
        }, 100);
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

});
