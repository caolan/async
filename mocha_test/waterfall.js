var async = require('../lib');
var expect = require('chai').expect;
var assert = require('assert');

describe("waterfall", function () {

    it('basics', function(done){
        var call_order = [];
        async.waterfall([
            function(callback){
                call_order.push('fn1');
                setTimeout(function(){callback(null, 'one', 'two');}, 0);
            },
            function(arg1, arg2, callback){
                call_order.push('fn2');
                expect(arg1).to.equal('one');
                expect(arg2).to.equal('two');
                setTimeout(function(){callback(null, arg1, arg2, 'three');}, 25);
            },
            function(arg1, arg2, arg3, callback){
                call_order.push('fn3');
                expect(arg1).to.equal('one');
                expect(arg2).to.equal('two');
                expect(arg3).to.equal('three');
                callback(null, 'four');
            },
            function(arg4, callback){
                call_order.push('fn4');
                expect(call_order).to.eql(['fn1','fn2','fn3','fn4']);
                callback(null, 'test');
            }
        ], function(err){
            expect(err === null, err + " passed instead of 'null'");
            done();
        });
    });

    it('empty array', function(done){
        async.waterfall([], function(err){
            if (err) throw err;
            done();
        });
    });

    it('non-array', function(done){
        async.waterfall({}, function(err){
            expect(err.message).to.equal('First argument to waterfall must be an array of functions');
            done();
        });
    });

    it('no callback', function(done){
        async.waterfall([
            function(callback){callback();},
            function(callback){callback(); done();}
        ]);
    });

    it('async', function(done){
        var call_order = [];
        async.waterfall([
            function(callback){
                call_order.push(1);
                callback();
                call_order.push(2);
            },
            function(callback){
                call_order.push(3);
                callback();
            },
            function(){
                expect(call_order).to.eql([1,3]);
                done();
            }
        ]);
    });

    it('error', function(done){
        async.waterfall([
            function(callback){
                callback('error');
            },
            function(callback){
                assert(false, 'next function should not be called');
                callback();
            }
        ], function(err){
            expect(err).to.equal('error');
            done();
        });
    });

    it('multiple callback calls', function(){
        var arr = [
            function(callback){
                // call the callback twice. this should call function 2 twice
                callback(null, 'one', 'two');
                callback(null, 'one', 'two');
            },
            function(arg1, arg2, callback){
                callback(null, arg1, arg2, 'three');
            }
        ];
        expect(function () {
            async.waterfall(arr, function () {});
        }).to.throw(/already called/);
    });

    it('call in another context @nycinvalid @nodeonly', function(done) {
        var vm = require('vm');
        var sandbox = {
            async: async,
            done: done
        };

        var fn = "(" + (function () {
            async.waterfall([function (callback) {
                callback();
            }], function (err) {
                if (err) {
                    return done(err);
                }
                done();
            });
        }).toString() + "())";

        vm.runInNewContext(fn, sandbox);
    });

    it('should not use unnecessary deferrals', function (done) {
        var sameStack = true;

        async.waterfall([
            function (cb) { cb(null, 1); },
            function (arg, cb) { cb(); }
        ], function() {
            expect(sameStack).to.equal(true);
            done();
        });

        sameStack = false;
    });
});
