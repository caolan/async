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

    it('concatLimit basics', function(done) {
        var running = 0;
        var concurrency = {
            'foo': 2,
            'bar': 2,
            'baz': 1
        };

        async.concatLimit(['foo', 'bar', 'baz'], 2, function(val, next) {
            running++;
            async.setImmediate(function() {
                expect(running).to.equal(concurrency[val]);
                running--;
                next(null, [val, val]);
            });
        }, function(err, result) {
            expect(running).to.equal(0);
            expect(err).to.eql(null);
            expect(result).to.eql(['foo', 'foo', 'bar', 'bar', 'baz', 'baz']);
            done();
        });
    });

    it('concatLimit error', function(done) {
        var arr = ['foo', 'bar', 'baz'];
        async.concatLimit(arr, 2, function(val, next) {
            if (val === 'bar') {
                return next(new Error('fail'));
            }
            next(null, [val, val]);
        }, function(err, result) {
            expect(err).to.not.eql(null);
            expect(result).to.eql(['foo', 'foo']);
            done();
        });
    });
});
