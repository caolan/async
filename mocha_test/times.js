var async = require('../lib');
var expect = require('chai').expect;
var assert = require('assert');

describe('times', function() {

    it('times', function(done) {
        async.times(5, function(n, next) {
            next(null, n);
        }, function(err, results) {
            assert(err === null, err + " passed instead of 'null'");
            expect(results).to.eql([0,1,2,3,4]);
            done();
        });
    });

    it('times 3', function(done) {
        var args = [];
        async.times(3, function(n, callback){
            setTimeout(function(){
                args.push(n);
                callback();
            }, n * 25);
        }, function(err){
            if (err) throw err;
            expect(args).to.eql([0,1,2]);
            done();
        });
    });

    it('times 0', function(done) {
        async.times(0, function(n, callback){
            assert(false, 'iteratee should not be called');
            callback();
        }, function(err){
            if (err) throw err;
            assert(true, 'should call callback');
        });
        setTimeout(done, 25);
    });

    it('times error', function(done) {
        async.times(3, function(n, callback){
            callback('error');
        }, function(err){
            expect(err).to.equal('error');
        });
        setTimeout(done, 50);
    });

    it('timesSeries', function(done) {
        var call_order = [];
        async.timesSeries(5, function(n, callback){
            setTimeout(function(){
                call_order.push(n);
                callback(null, n);
            }, 100 - n * 10);
        }, function(err, results){
            expect(call_order).to.eql([0,1,2,3,4]);
            expect(results).to.eql([0,1,2,3,4]);
            done();
        });
    });

    it('timesSeries error', function(done) {
        async.timesSeries(5, function(n, callback){
            callback('error');
        }, function(err){
            expect(err).to.equal('error');
        });
        setTimeout(done, 50);
    });

    it('timesLimit', function(done) {
        var limit = 2;
        var running = 0;
        async.timesLimit(5, limit, function (i, next) {
            running++;
            assert(running <= limit && running > 0, running);
            setTimeout(function () {
                running--;
                next(null, i * 2);
            }, (3 - i) * 10);
        }, function(err, results){
            assert(err === null, err + " passed instead of 'null'");
            expect(results).to.eql([0, 2, 4, 6, 8]);
            done();
        });
    });
});
