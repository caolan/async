var async = require('../lib');
var expect = require('chai').expect;
var assert = require('assert');

describe("memoize", function() {

    it('memoize', function(done) {
        var call_order = [];

        var fn = function (arg1, arg2, callback) {
            async.setImmediate(function () {
                call_order.push(['fn', arg1, arg2]);
                callback(null, arg1 + arg2);
            });
        };

        var fn2 = async.memoize(fn);
        fn2(1, 2, function (err, result) {
            assert(err === null, err + " passed instead of 'null'");
            expect(result).to.equal(3);
            fn2(1, 2, function (err, result) {
                expect(result).to.equal(3);
                fn2(2, 2, function (err, result) {
                    expect(result).to.equal(4);
                    expect(call_order).to.eql([['fn',1,2], ['fn',2,2]]);
                    done();
                });
            });
        });
    });

    it('maintains asynchrony', function(done) {
        var call_order = [];

        var fn = function (arg1, arg2, callback) {
            call_order.push(['fn', arg1, arg2]);
            async.setImmediate(function () {
                call_order.push(['cb', arg1, arg2]);
                callback(null, arg1 + arg2);
            });
        };

        var fn2 = async.memoize(fn);
        fn2(1, 2, function (err, result) {
            expect(result).to.equal(3);
            fn2(1, 2, function (err, result) {
                expect(result).to.equal(3);
                async.nextTick(memoize_done);
                call_order.push('tick3');
            });
            call_order.push('tick2');
        });
        call_order.push('tick1');

        function memoize_done() {
            var async_call_order = [
                ['fn',1,2],             // initial async call
                'tick1',                // async caller
                ['cb',1,2],             // async callback
            //  ['fn',1,2], // memoized // memoized async body
                'tick2',                // handler for first async call
            //  ['cb',1,2], // memoized // memoized async response body
                'tick3'                 // handler for memoized async call
            ];
            expect(call_order).to.eql(async_call_order);
            done();
        }
    });

    it('unmemoize', function(done) {
        var call_order = [];

        var fn = function (arg1, arg2, callback) {
            call_order.push(['fn', arg1, arg2]);
            async.setImmediate(function () {
                callback(null, arg1 + arg2);
            });
        };

        var fn2 = async.memoize(fn);
        var fn3 = async.unmemoize(fn2);
        fn3(1, 2, function (err, result) {
            expect(result).to.equal(3);
            fn3(1, 2, function (err, result) {
                expect(result).to.equal(3);
                fn3(2, 2, function (err, result) {
                    expect(result).to.equal(4);
                    expect(call_order).to.eql([['fn',1,2], ['fn',1,2], ['fn',2,2]]);
                    done();
                });
            });
        });
    });

    it('unmemoize a not memoized function', function(done) {
        var fn = function (arg1, arg2, callback) {
            callback(null, arg1 + arg2);
        };

        var fn2 = async.unmemoize(fn);
        fn2(1, 2, function(err, result) {
            expect(result).to.equal(3);
        });

        done();
    });

    it('error', function(done) {
        var testerr = new Error('test');
        var fn = function (arg1, arg2, callback) {
            callback(testerr, arg1 + arg2);
        };
        async.memoize(fn)(1, 2, function (err) {
            expect(err).to.equal(testerr);
        });
        done();
    });

    it('multiple calls', function(done) {
        var fn = function (arg1, arg2, callback) {
            assert(true);
            setTimeout(function(){
                callback(null, arg1, arg2);
            }, 10);
        };
        var fn2 = async.memoize(fn);
        fn2(1, 2, function(err, result) {
            expect(result).to.equal(1, 2);
        });
        fn2(1, 2, function(err, result) {
            expect(result).to.equal(1, 2);
            done();
        });
    });

    it('custom hash function', function(done) {
        var testerr = new Error('test');

        var fn = function (arg1, arg2, callback) {
            callback(testerr, arg1 + arg2);
        };
        var fn2 = async.memoize(fn, function () {
            return 'custom hash';
        });
        fn2(1, 2, function (err, result) {
            expect(result).to.equal(3);
            fn2(2, 2, function (err, result) {
                expect(result).to.equal(3);
                done();
            });
        });
    });

    it('manually added memo value', function(done) {
        var fn = async.memoize(function() {
            throw new Error("Function should never be called");
        });
        fn.memo.foo = ["bar"];
        fn("foo", function(val) {
            expect(val).to.equal("bar");
            done();
        });
    });

    it('avoid constructor key return undefined', function(done) {
        var fn = async.memoize(function(name, callback) {
            setTimeout(function(){
                callback(null, name);
            }, 100);
        });
        fn('constructor', function(error, results) {
            expect(results).to.equal('constructor');
            done();
        });
    });

    it('avoid __proto__ key return undefined', function(done) {
        // Skip test if there is a Object.create bug (node 0.10 and some Chrome 30x versions)
        var x = Object.create(null);
        /* jshint proto: true */
        x.__proto__ = 'foo';
        if (x.__proto__ !== 'foo') {
            return done();
        }

        var fn = async.memoize(function(name, callback) {
            setTimeout(function(){
                callback(null, name);
            }, 100);
        });
        fn('__proto__', function(error, results) {
            expect(results).to.equal('__proto__');
            done();
        });
    });

    it('allow hasOwnProperty as key', function(done) {
        var fn = async.memoize(function(name, callback) {
            setTimeout(function(){
                callback(null, name);
            }, 100);
        });
        fn('hasOwnProperty', function(error, results) {
            expect(results).to.equal('hasOwnProperty');
            done();
        });
    });
});
