var async = require('../lib');
var {expect} = require('chai');
var assert = require('assert');

describe("waterfall", () => {

    it('basics', (done) => {
        var call_order = [];
        async.waterfall([
            function(callback){
                call_order.push('fn1');
                setTimeout(() => {callback(null, 'one', 'two');}, 0);
            },
            function(arg1, arg2, callback){
                call_order.push('fn2');
                expect(arg1).to.equal('one');
                expect(arg2).to.equal('two');
                setTimeout(() => {callback(null, arg1, arg2, 'three');}, 25);
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
        ], (err) => {
            expect(err === null, err + " passed instead of 'null'");
            done();
        });
    });

    it('empty array', (done) => {
        async.waterfall([], (err) => {
            if (err) throw err;
            done();
        });
    });

    it('non-array', (done) => {
        async.waterfall({}, (err) => {
            expect(err.message).to.equal('First argument to waterfall must be an array of functions');
            done();
        });
    });

    it('no callback', (done) => {
        async.waterfall([
            function(callback){callback();},
            function(callback){callback(); done();}
        ]);
    });

    it('async', (done) => {
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

    it('error', (done) => {
        async.waterfall([
            function(callback){
                callback('error');
            },
            function(callback){
                assert(false, 'next function should not be called');
                callback();
            }
        ], (err) => {
            expect(err).to.equal('error');
            done();
        });
    });


    it('canceled', (done) => {
        const call_order = []
        async.waterfall([
            function(callback){
                call_order.push(1)
                callback(false);
            },
            function(callback){
                call_order.push(2)
                assert(false, 'next function should not be called');
                callback();
            }
        ], () => {
            throw new Error('should not get here')
        });
        setTimeout(() => {
            expect(call_order).to.eql([1])
            done()
        }, 10)
    });

    it('multiple callback calls', () => {
        var arr = [
            function(callback){
                callback(null, 'one', 'two');
                callback(null, 'one', 'two');
            },
            function(arg1, arg2, callback){
                callback(null, arg1, arg2, 'three');
            }
        ];
        expect(() => {
            async.waterfall(arr, () => {});
        }).to.throw(/already called/);
    });

    it('multiple callback calls (trickier) @nodeonly', (done) => {

        // do a weird dance to catch the async thrown error before mocha
        var listeners = process.listeners('uncaughtException');
        process.removeAllListeners('uncaughtException');
        process.once('uncaughtException', (err) => {
            listeners.forEach((listener) => {
                process.on('uncaughtException', listener);
            });
            // can't throw errors in a uncaughtException handler, defer
            setTimeout(checkErr, 0, err)
        })

        function checkErr(err) {
            expect(err.message).to.match(/already called/);
            done();
        }

        async.waterfall([
            function(callback){
                setTimeout(callback, 0, null, 'one', 'two');
                setTimeout(callback, 2, null, 'one', 'two');
            },
            function(arg1, arg2, callback){
                setTimeout(callback, 15, null, arg1, arg2, 'three');
            }
        ]);
    });

    it('call in another context @nycinvalid @nodeonly', (done) => {
        var vm = require('vm');
        var sandbox = {
            async,
            done
        };

        var fn = "(" + (function () {
            async.waterfall([function (callback) {
                callback();
            }], (err) => {
                if (err) {
                    return done(err);
                }
                done();
            });
        }).toString() + "())";

        vm.runInNewContext(fn, sandbox);
    });

    it('should not use unnecessary deferrals', (done) => {
        var sameStack = true;

        async.waterfall([
            function (cb) { cb(null, 1); },
            function (arg, cb) { cb(); }
        ], () => {
            expect(sameStack).to.equal(true);
            done();
        });

        sameStack = false;
    });
});
