var async = require('../lib');
var expect = require('chai').expect;

function filterIteratee(x, callback) {
    setTimeout(function(){
        callback(null, x % 2);
    }, x*5);
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
        async.filter([3,1,2], filterIteratee, function(err, results){
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

    it('filter collection', function(done){
        var a = {a: 3, b: 1, c: 2};
        async.filter(a, function(x, callback){
            callback(null, x % 2);
        }, function(err, results){
            expect(err).to.equal(null);
            expect(results).to.eql([3,1]);
            expect(a).to.eql({a: 3, b: 1, c: 2});
            done();
        });
    });

    if (typeof Symbol === 'function' && Symbol.iterator) {
        function makeIterator(array){
            var nextIndex;
            let iterator = {
                next: function(){
                    return nextIndex < array.length ?
                       {value: array[nextIndex++], done: false} :
                       {done: true};
                }
            };
            iterator[Symbol.iterator] = function() {
                nextIndex = 0; // reset iterator
                return iterator;
            };
            return iterator;
        }

        it('filter iterator', function(done){
            var a = makeIterator([500, 20, 100]);
            async.filter(a, function(x, callback) {
                setTimeout(function() {
                    callback(null, x > 20);
                }, x);
            }, function(err, results){
                expect(err).to.equal(null);
                expect(results).to.eql([500, 100]);
                done();
            });
        });
    }

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
        async.filterSeries([3,1,2], filterIteratee, function(err, results){
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
        async.reject([3,1,2], filterIteratee, function(err, results){
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
        async.rejectSeries([3,1,2], filterIteratee, function(err, results){
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
