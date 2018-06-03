var async = require('../lib');
var expect = require('chai').expect;
var assert = require('assert');
var getFunctionsObject = require('./support/get_function_object');

describe('parallel', function() {

    it('parallel', function(done) {
        var call_order = [];
        async.parallel([
            function(callback){
                setTimeout(function(){
                    call_order.push(1);
                    callback(null, 1);
                }, 50);
            },
            function(callback){
                setTimeout(function(){
                    call_order.push(2);
                    callback(null, 2);
                }, 100);
            },
            function(callback){
                setTimeout(function(){
                    call_order.push(3);
                    callback(null, 3,3);
                }, 25);
            }
        ],
        function(err, results){
            assert(err === null, err + " passed instead of 'null'");
            expect(call_order).to.eql([3,1,2]);
            expect(results).to.eql([1,2,[3,3]]);
            done();
        });
    });

    it('parallel empty array', function(done) {
        async.parallel([], function(err, results){
            assert(err === null, err + " passed instead of 'null'");
            expect(results).to.eql([]);
            done();
        });
    });

    it('parallel error', function(done) {
        async.parallel([
            function(callback){
                callback('error', 1);
            },
            function(callback){
                callback('error2', 2);
            }
        ],
        function(err){
            expect(err).to.equal('error');
        });
        setTimeout(done, 100);
    });

    it('parallel no callback', function(done) {
        async.parallel([
            function(callback){callback();},
            function(callback){callback(); done();},
        ]);
    });

    it('parallel object', function(done) {
        var call_order = [];
        async.parallel(getFunctionsObject(call_order), function(err, results){
            expect(err).to.equal(null);
            expect(call_order).to.eql([3,1,2]);
            expect(results).to.eql({
                one: 1,
                two: 2,
                three: [3,3]
            });
            done();
        });
    });

    // Issue 10 on github: https://github.com/caolan/async/issues#issue/10
    it('paralel falsy return values', function(done) {
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
        async.parallel(
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


    it('parallel limit', function(done) {
        var call_order = [];
        async.parallelLimit([
            function(callback){
                setTimeout(function(){
                    call_order.push(1);
                    callback(null, 1);
                }, 50);
            },
            function(callback){
                setTimeout(function(){
                    call_order.push(2);
                    callback(null, 2);
                }, 100);
            },
            function(callback){
                setTimeout(function(){
                    call_order.push(3);
                    callback(null, 3,3);
                }, 25);
            }
        ],
        2,
        function(err, results){
            assert(err === null, err + " passed instead of 'null'");
            expect(call_order).to.eql([1,3,2]);
            expect(results).to.eql([1,2,[3,3]]);
            done();
        });
    });

    it('parallel limit empty array', function(done) {
        async.parallelLimit([], 2, function(err, results){
            assert(err === null, err + " passed instead of 'null'");
            expect(results).to.eql([]);
            done();
        });
    });

    it('parallel limit error', function(done) {
        async.parallelLimit([
            function(callback){
                callback('error', 1);
            },
            function(callback){
                callback('error2', 2);
            }
        ],
        1,
        function(err){
            expect(err).to.equal('error');
        });
        setTimeout(done, 100);
    });

    it('parallel limit no callback', function(done) {
        async.parallelLimit([
            function(callback){callback();},
            function(callback){callback(); done();},
        ], 1);
    });

    it('parallel limit object', function(done) {
        var call_order = [];
        async.parallelLimit(getFunctionsObject(call_order), 2, function(err, results){
            expect(err).to.equal(null);
            expect(call_order).to.eql([1,3,2]);
            expect(results).to.eql({
                one: 1,
                two: 2,
                three: [3,3]
            });
            done();
        });
    });

    it('parallel call in another context @nycinvalid @nodeonly', function(done) {
        var vm = require('vm');
        var sandbox = {
            async: async,
            done: done
        };

        var fn = "(" + (function () {
            async.parallel([function (callback) {
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

    it('parallel error with reflect', function(done) {
        async.parallel([
            async.reflect(function(callback){
                callback('error', 1);
            }),
            async.reflect(function(callback){
                callback('error2', 2);
            }),
            async.reflect(function(callback){
                callback(null, 2);
            })
        ],
        function(err, results){
            assert(err === null, err + " passed instead of 'null'");
            expect(results).to.eql([
                { error: 'error' },
                { error: 'error2' },
                { value: 2 }
            ]);
            done();
        });
    });

    it('parallel object with reflect all (values and errors)', function(done) {
        var tasks = {
            one: function(callback) {
                setTimeout(function() {
                    callback(null, 'one');
                }, 200);
            },
            two: function(callback) {
                callback('two');
            },
            three: function(callback) {
                setTimeout(function() {
                    callback(null, 'three');
                }, 100);
            }
        };

        async.parallel(async.reflectAll(tasks), function(err, results) {
            expect(results).to.eql({
                one: { value: 'one' },
                two: { error: 'two' },
                three: { value: 'three' }
            });
            done();
        })
    });

    it('parallel empty object with reflect all', function(done) {
        var tasks = {};

        async.parallel(async.reflectAll(tasks), function(err, results) {
            expect(results).to.eql({});
            done();
        })
    });

    it('parallel empty object with reflect all (errors)', function(done) {
        var tasks = {
            one: function(callback) {
                callback('one');
            },
            two: function(callback) {
                callback('two');
            },
            three: function(callback) {
                callback('three');
            }
        };

        async.parallel(async.reflectAll(tasks), function(err, results) {
            expect(results).to.eql({
                one: { error: 'one' },
                two: { error: 'two' },
                three: { error: 'three' }
            });
            done();
        })
    });

    it('parallel empty object with reflect all (values)', function(done) {
        var tasks = {
            one: function(callback) {
                callback(null, 'one');
            },
            two: function(callback) {
                callback(null, 'two');
            },
            three: function(callback) {
                callback(null, 'three');
            }
        };

        async.parallel(async.reflectAll(tasks), function(err, results) {
            expect(results).to.eql({
                one: { value: 'one' },
                two: { value: 'two' },
                three: { value: 'three' }
            });
            done();
        })
    });

    it('parallel does not continue replenishing after error', function(done) {
        var started = 0;
        var arr = [
            funcToCall,
            funcToCall,
            funcToCall,
            funcToCall,
            funcToCall,
            funcToCall,
            funcToCall,
            funcToCall,
            funcToCall,
        ];
        var delay = 10;
        var limit = 3;
        var maxTime = 10 * arr.length;
        function funcToCall(callback) {
            started ++;
            if (started === 3) {
                return callback(new Error ("Test Error"));
            }
            setTimeout(function(){
                callback();
            }, delay);
        }

        async.parallelLimit(arr, limit, function(){});

        setTimeout(function(){
            expect(started).to.equal(3);
            done();
        }, maxTime);
    });
});
