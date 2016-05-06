var async = require('../lib');
var expect = require('chai').expect;

describe('transform', function() {

    it('transform implictly determines memo if not provided', function(done) {
        async.transform([1,2,3], function(memo, x, v, callback){
            memo.push(x + 1);
            callback();
        }, function(err, result){
            expect(result).to.eql([2, 3, 4]);
            done();
        });
    });

    it('transform async with object memo', function(done) {
        async.transform([1,3,2], {}, function(memo, v, k, callback){
            setTimeout(function() {
                memo[k] = v;
                callback();
            });
        }, function(err, result) {
            expect(err).to.equal(null);
            expect(result).to.eql({
                0: 1,
                1: 3,
                2: 2
            });
            done();
        });
    });

    it('transform iterating object', function(done) {
        async.transform({a: 1, b: 3, c: 2}, function(memo, v, k, callback){
            setTimeout(function() {
                memo[k] = v + 1;
                callback();
            });
        }, function(err, result) {
            expect(err).to.equal(null);
            expect(result).to.eql({a: 2, b: 4, c: 3});
            done();
        });
    });

    it('transform error', function(done) {
        async.transform([1,2,3], function(a, v, k, callback){
            callback('error');
        }, function(err){
            expect(err).to.equal('error');
            done();
        });
    });
});
