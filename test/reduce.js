var async = require('../lib');
var expect = require('chai').expect;
var assert = require('assert');

describe('reduce', function() {

    it('reduce', function(done) {
        var call_order = [];
        async.reduce([1,2,3], 0, function(a, x, callback){
            call_order.push(x);
            callback(null, a + x);
        }, function(err, result){
            assert(err === null, err + " passed instead of 'null'");
            expect(result).to.equal(6);
            expect(call_order).to.eql([1,2,3]);
            done();
        });
    });

    it('reduce async with non-reference memo', function(done) {
        async.reduce([1,3,2], 0, function(a, x, callback){
            setTimeout(function(){callback(null, a + x);}, Math.random()*100);
        }, function(err, result){
            expect(result).to.equal(6);
            done();
        });
    });

    it('reduce error', function(done) {
        async.reduce([1,2,3], 0, function(a, x, callback){
            callback('error');
        }, function(err){
            expect(err).to.equal('error');
        });
        setTimeout(done, 50);
    });

    it('inject alias', function(done) {
        expect(async.inject).to.equal(async.reduce);
        done();
    });

    it('foldl alias', function(done) {
        expect(async.foldl).to.equal(async.reduce);
        done();
    });

    it('reduceRight', function(done) {
        var call_order = [];
        var a = [1,2,3];
        async.reduceRight(a, 0, function(a, x, callback){
            call_order.push(x);
            callback(null, a + x);
        }, function(err, result){
            expect(result).to.equal(6);
            expect(call_order).to.eql([3,2,1]);
            expect(a).to.eql([1,2,3]);
            done();
        });
    });

    it('foldr alias', function(done) {
        expect(async.foldr).to.equal(async.reduceRight);
        done();
    });
});
