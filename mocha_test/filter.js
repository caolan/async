var async = require('../lib');
var expect = require('chai').expect;

function filterIterator(x, callback) {
    setTimeout(function(){
        callback(null, x % 2);
    }, x*25);
}

function testLimit(arr, limitFunc, limit, iter, done) {
    var args = [];

    limitFunc(arr, limit, function(x) {
        args.push(x);
        iter.apply(this, arguments);
    }, function() {
        expect(args).to.eql(arr);
        done.apply(this, arguments);
    });
}

describe("filter", function () {

    it('filter', function(done){
        async.filter([3,1,2], filterIterator, function(err, results){
            expect(err).to.equal(null);
            expect(results).to.eql([3,1]);
            done();
        });
    });

    it('filter original untouched', function(done){
        var a = [3,1,2];
        async.filter(a, function(x, callback){
            callback(null, x % 2);
        }, function(err, results){
            expect(err).to.equal(null);
            expect(results).to.eql([3,1]);
            expect(a).to.eql([3,1,2]);
            done();
        });
    });

    it('filter error', function(done){
        async.filter([3,1,2], function(x, callback){
            callback('error');
        } , function(err, results){
            expect(err).to.equal('error');
            expect(results).to.not.exist;
            done();
        });
    });

    it('filterSeries', function(done){
        async.filterSeries([3,1,2], filterIterator, function(err, results){
            expect(err).to.equal(null);
            expect(results).to.eql([3,1]);
            done();
        });
    });

    it('select alias', function(){
        expect(async.select).to.equal(async.filter);
    });

    it('selectSeries alias', function(){
        expect(async.selectSeries).to.equal(async.filterSeries);
    });

    it('filterLimit', function(done) {
        testLimit([5, 4, 3, 2, 1], async.filterLimit, 2, function(v, next) {
            next(null, v % 2);
        }, function(err, result){
            expect(err).to.equal(null);
            expect(result).to.eql([5, 3, 1]);
            done();
        });
    });

});

describe("reject", function () {

    it('reject', function(done){
        async.reject([3,1,2], filterIterator, function(err, results){
            expect(err).to.equal(null);
            expect(results).to.eql([2]);
            done();
        });
    });

    it('reject original untouched', function(done){
        var a = [3,1,2];
        async.reject(a, function(x, callback){
            callback(null, x % 2);
        }, function(err, results){
            expect(err).to.equal(null);
            expect(results).to.eql([2]);
            expect(a).to.eql([3,1,2]);
            done();
        });
    });

    it('reject error', function(done){
        async.reject([3,1,2], function(x, callback){
            callback('error');
        } , function(err, results){
            expect(err).to.equal('error');
            expect(results).to.not.exist;
            done();
        });
    });

    it('rejectSeries', function(done){
        async.rejectSeries([3,1,2], filterIterator, function(err, results){
            expect(err).to.equal(null);
            expect(results).to.eql([2]);
            done();
        });
    });

    it('rejectLimit', function(done) {
        testLimit([5, 4, 3, 2, 1], async.rejectLimit, 2, function(v, next) {
            next(null, v % 2);
        }, function(err, result){
            expect(err).to.equal(null);
            expect(result).to.eql([4, 2]);
            done();
        });
    });

});
