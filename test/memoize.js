var async = require('../lib');
var {expect} = require('chai');
var assert = require('assert');

describe("memoize", () => {

    it('memoize', (done) => {
        var call_order = [];

        var fn = function (arg1, arg2, callback) {
            async.setImmediate(() => {
                call_order.push(['fn', arg1, arg2]);
                callback(null, arg1 + arg2);
            });
        };

        var fn2 = async.memoize(fn);
        fn2(1, 2, (err, result) => {
            assert(err === null, err + " passed instead of 'null'");
            expect(result).to.equal(3);
            fn2(1, 2, (err2, result2) => {
                expect(result2).to.equal(3);
                fn2(2, 2, (err3, result3) => {
                    expect(result3).to.equal(4);
                    expect(call_order).to.eql([['fn',1,2], ['fn',2,2]]);
                    done();
                });
            });
        });
    });

    it('maintains asynchrony', (done) => {
        var call_order = [];

        var fn = function (arg1, arg2, callback) {
            call_order.push(['fn', arg1, arg2]);
            async.setImmediate(() => {
                call_order.push(['cb', arg1, arg2]);
                callback(null, arg1 + arg2);
            });
        };

        var fn2 = async.memoize(fn);
        fn2(1, 2, (err, result) => {
            expect(result).to.equal(3);
            fn2(1, 2, (err2, result2) => {
                expect(result2).to.equal(3);
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

    it('unmemoize', (done) => {
        var call_order = [];

        var fn = function (arg1, arg2, callback) {
            call_order.push(['fn', arg1, arg2]);
            async.setImmediate(() => {
                callback(null, arg1 + arg2);
            });
        };

        var fn2 = async.memoize(fn);
        var fn3 = async.unmemoize(fn2);
        fn3(1, 2, (err, result) => {
            expect(result).to.equal(3);
            fn3(1, 2, (err2, result2) => {
                expect(result2).to.equal(3);
                fn3(2, 2, (err3, result3) => {
                    expect(result3).to.equal(4);
                    expect(call_order).to.eql([['fn',1,2], ['fn',1,2], ['fn',2,2]]);
                    done();
                });
            });
        });
    });

    it('unmemoize a not memoized function', (done) => {
        var fn = function (arg1, arg2, callback) {
            callback(null, arg1 + arg2);
        };

        var fn2 = async.unmemoize(fn);
        fn2(1, 2, (err, result) => {
            expect(result).to.equal(3);
            done();
        });
    });

    it('error', (done) => {
        var testerr = new Error('test');
        var fn = function (arg1, arg2, callback) {
            callback(testerr, arg1 + arg2);
        };
        async.memoize(fn)(1, 2, (err) => {
            expect(err).to.equal(testerr);
            done();
        });
    });

    it('should not memoize result if error occurs', (done) => {
        var testerr = new Error('test');
        var fn = function (arg1, arg2, callback) {
            callback(testerr, arg1 + arg2);
        };
        var memoized = async.memoize(fn);
        memoized(1, 2, (err) => {
            expect(err).to.equal(testerr);
            testerr = null;

            memoized(1, 3, (err2, result) => {
                expect(err2).to.equal(null);
                expect(result).to.equal(4);
                done();
            });
        });
    });

    it('multiple calls', (done) => {
        var fn = function (arg1, arg2, callback) {
            assert(true);
            setTimeout(() => {
                callback(null, arg1, arg2);
            }, 10);
        };
        var fn2 = async.memoize(fn);
        fn2(1, 2, (err, result) => {
            expect(result).to.equal(1, 2);
        });
        fn2(1, 2, (err, result) => {
            expect(result).to.equal(1, 2);
            done();
        });
    });

    it('custom hash function', (done) => {
        var fn = function (arg1, arg2, callback) {
            callback(null, arg1 + arg2);
        };
        var fn2 = async.memoize(fn, () => {
            return 'custom hash';
        });
        fn2(1, 2, (err, result) => {
            expect(result).to.equal(3);
            fn2(2, 2, (err2, result2) => {
                expect(result2).to.equal(3);
                done();
            });
        });
    });

    it('manually added memo value', (done) => {
        var fn = async.memoize(() => {
            throw new Error("Function should never be called");
        });
        fn.memo.foo = ["bar"];
        fn("foo", (err, val) => {
            expect(val).to.equal("bar");
            done();
        });
    });

    it('avoid constructor key return undefined', (done) => {
        var fn = async.memoize((name, callback) => {
            setTimeout(() => {
                callback(null, name);
            }, 100);
        });
        fn('constructor', (error, results) => {
            expect(results).to.equal('constructor');
            done();
        });
    });

    it('avoid __proto__ key return undefined', (done) => {
        // Skip test if there is a Object.create bug (node 0.10 and some Chrome 30x versions)
        var x = Object.create(null);
        /* jshint proto: true */
        x.__proto__ = 'foo';
        if (x.__proto__ !== 'foo') {
            return done();
        }

        var fn = async.memoize((name, callback) => {
            setTimeout(() => {
                callback(null, name);
            }, 100);
        });
        fn('__proto__', (error, results) => {
            expect(results).to.equal('__proto__');
            done();
        });
    });

    it('allow hasOwnProperty as key', (done) => {
        var fn = async.memoize((name, callback) => {
            setTimeout(() => {
                callback(null, name);
            }, 100);
        });
        fn('hasOwnProperty', (error, results) => {
            expect(results).to.equal('hasOwnProperty');
            done();
        });
    });

});
