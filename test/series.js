var async = require('../lib');
var expect = require('chai').expect;
var assert = require('assert');
var getFunctionsObject = require('./support/get_function_object');

describe('series', function() {
    it('series', function(done) {
        var call_order = [];
        async.series([
            function(callback){
                setTimeout(function(){
                    call_order.push(1);
                    callback(null, 1);
                }, 25);
            },
            function(callback){
                setTimeout(function(){
                    call_order.push(2);
                    callback(null, 2);
                }, 50);
            },
            function(callback){
                setTimeout(function(){
                    call_order.push(3);
                    callback(null, 3,3);
                }, 15);
            }
        ],
        function(err, results){
            assert(err === null, err + " passed instead of 'null'");
            expect(results).to.eql([1,2,[3,3]]);
            expect(call_order).to.eql([1,2,3]);
            done();
        });
    });

    it('with reflect', function(done) {
        var call_order = [];
        async.series([
            async.reflect(function(callback){
                setTimeout(function(){
                    call_order.push(1);
                    callback(null, 1);
                }, 25);
            }),
            async.reflect(function(callback){
                setTimeout(function(){
                    call_order.push(2);
                    callback(null, 2);
                }, 50);
            }),
            async.reflect(function(callback){
                setTimeout(function(){
                    call_order.push(3);
                    callback(null, 3,3);
                }, 15);
            })
        ],
        function(err, results){
            assert(err === null, err + " passed instead of 'null'");
            expect(results).to.eql([
                { value: 1 },
                { value: 2 },
                { value: [3,3] }
            ]);
            expect(call_order).to.eql([1,2,3]);
            done();
        });
    });

    it('empty array', function(done) {
        async.series([], function(err, results){
            expect(err).to.equal(null);
            expect(results).to.eql([]);
            done();
        });
    });

    it('error', function(done) {
        async.series([
            function(callback){
                callback('error', 1);
            },
            function(callback){
                assert(false, 'should not be called');
                callback('error2', 2);
            }
        ],
        function(err){
            expect(err).to.equal('error');
        });
        setTimeout(done, 100);
    });

    it('error with reflect', function(done) {
        async.series([
            async.reflect(function(callback){
                callback('error', 1);
            }),
            async.reflect(function(callback){
                callback('error2', 2);
            }),
            async.reflect(function(callback){
                callback(null, 1);
            })
        ],
        function(err, results){
            assert(err === null, err + " passed instead of 'null'");
            expect(results).to.eql([
                { error: 'error' },
                { error: 'error2' },
                { value: 1 }
            ]);
            done();
        });
    });

    it('no callback', function(done) {
        async.series([
            function(callback){callback();},
            function(callback){callback(); done();},
        ]);
    });

    it('object', function(done) {
        var call_order = [];
        async.series(getFunctionsObject(call_order), function(err, results){
            expect(err).to.equal(null);
            expect(results).to.eql({
                one: 1,
                two: 2,
                three: [3,3]
            });
            expect(call_order).to.eql([1,2,3]);
            done();
        });
    });

    it('call in another context @nycinvalid @nodeonly', function(done) {
        var vm = require('vm');
        var sandbox = {
            async: async,
            done: done
        };

        var fn = "(" + (function () {
            async.series([function (callback) {
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

    // Issue 10 on github: https://github.com/caolan/async/issues#issue/10
    it('falsy return values', function(done) {
        function taskFalse(callback) {
            async.nextTick(function() {
                callback(null, false);
            });
        }
        function taskUndefined(callback) {
            async.nextTick(function() {
                callback(null, undefined);
            });
        }
        function taskEmpty(callback) {
            async.nextTick(function() {
                callback(null);
            });
        }
        function taskNull(callback) {
            async.nextTick(function() {
                callback(null, null);
            });
        }
        async.series(
            [taskFalse, taskUndefined, taskEmpty, taskNull],
            function(err, results) {
                expect(results.length).to.equal(4);
                assert.strictEqual(results[0], false);
                assert.strictEqual(results[1], undefined);
                assert.strictEqual(results[2], undefined);
                assert.strictEqual(results[3], null);
                done();
            }
        );
    });
});
