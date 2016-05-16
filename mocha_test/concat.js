var async = require('../lib');
var expect = require('chai').expect;
var assert = require('assert');

describe('concat', function() {
    it('concat', function(done) {
        var call_order = [];
        var iteratee = function (x, cb) {
            setTimeout(function(){
                call_order.push(x);
                var r = [];
                while (x > 0) {
                    r.push(x);
                    x--;
                }
                cb(null, r);
            }, x*25);
        };
        async.concat([1,3,2], iteratee, function(err, results){
            expect(results).to.eql([1,2,1,3,2,1]);
            expect(call_order).to.eql([1,2,3]);
            assert(err === null, err + " passed instead of 'null'");
            done();
        });
    });

    it('concat error', function(done) {
        var iteratee = function (x, cb) {
            cb(new Error('test error'));
        };
        async.concat([1,2,3], iteratee, function(err){
            assert(err);
            done();
        });
    });

    it('concatSeries', function(done) {
        var call_order = [];
        var iteratee = function (x, cb) {
            setTimeout(function(){
                call_order.push(x);
                var r = [];
                while (x > 0) {
                    r.push(x);
                    x--;
                }
                cb(null, r);
            }, x*25);
        };
        async.concatSeries([1,3,2], iteratee, function(err, results){
            expect(results).to.eql([1,3,2,1,2,1]);
            expect(call_order).to.eql([1,3,2]);
            assert(err === null, err + " passed instead of 'null'");
            done();
        });
    });
});
