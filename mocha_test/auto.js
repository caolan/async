var async = require('../lib');
var expect = require('chai').expect;
var _ = require('lodash');

describe('auto', function () {

    it('basics', function(done){
        var callOrder = [];
        async.auto({
            task1: ['task2', function(results, callback){
                setTimeout(function(){
                    callOrder.push('task1');
                    callback();
                }, 25);
            }],
            task2: function(callback){
                setTimeout(function(){
                    callOrder.push('task2');
                    callback();
                }, 50);
            },
            task3: ['task2', function(results, callback){
                callOrder.push('task3');
                callback();
            }],
            task4: ['task1', 'task2', function(results, callback){
                callOrder.push('task4');
                callback();
            }],
            task5: ['task2', function(results, callback){
                setTimeout(function(){
                    callOrder.push('task5');
                    callback();
                }, 0);
            }],
            task6: ['task2', function(results, callback){
                callOrder.push('task6');
                callback();
            }]
        },
        function(err){
            expect(err).to.equal(null);
            expect(callOrder).to.eql(['task2','task3','task6','task5','task1','task4']);
            done();
        });
    });

    it('auto concurrency', function (done) {
        var concurrency = 2;
        var runningTasks = [];

        function makeCallback(taskName) {
            return function(/*..., callback*/) {
                var callback = _.last(arguments);
                runningTasks.push(taskName);
                setTimeout(function(){
                    // Each task returns the array of running tasks as results.
                    var result = runningTasks.slice(0);
                    runningTasks.splice(runningTasks.indexOf(taskName), 1);
                    callback(null, result);
                });
            };
        }

        async.auto({
            task1: ['task2', makeCallback('task1')],
            task2: makeCallback('task2'),
            task3: ['task2', makeCallback('task3')],
            task4: ['task1', 'task2', makeCallback('task4')],
            task5: ['task2', makeCallback('task5')],
            task6: ['task2', makeCallback('task6')]
        }, concurrency, function(err, results){
            _.each(results, function(result) {
                expect(result.length).to.be.below(concurrency + 1);
            });
            done();
        });
    });

    it('auto petrify', function (done) {
        var callOrder = [];
        async.auto({
            task1: ['task2', function (results, callback) {
                setTimeout(function () {
                    callOrder.push('task1');
                    callback();
                }, 100);
            }],
            task2: function (callback) {
                setTimeout(function () {
                    callOrder.push('task2');
                    callback();
                }, 200);
            },
            task3: ['task2', function (results, callback) {
                callOrder.push('task3');
                callback();
            }],
            task4: ['task1', 'task2', function (results, callback) {
                callOrder.push('task4');
                callback();
            }]
        },
        function (err) {
            if (err) throw err;
            expect(callOrder).to.eql(['task2', 'task3', 'task1', 'task4']);
            done();
        });
    });

    it('auto results', function(done){
        var callOrder = [];
        async.auto({
            task1: ['task2', function(results, callback){
                expect(results.task2).to.eql('task2');
                setTimeout(function(){
                    callOrder.push('task1');
                    callback(null, 'task1a', 'task1b');
                }, 25);
            }],
            task2: function(callback){
                setTimeout(function(){
                    callOrder.push('task2');
                    callback(null, 'task2');
                }, 50);
            },
            task3: ['task2', function(results, callback){
                expect(results.task2).to.eql('task2');
                callOrder.push('task3');
                callback(null);
            }],
            task4: ['task1', 'task2', function(results, callback){
                expect(results.task1).to.eql(['task1a','task1b']);
                expect(results.task2).to.eql('task2');
                callOrder.push('task4');
                callback(null, 'task4');
            }]
        },
        function(err, results){
            expect(callOrder).to.eql(['task2','task3','task1','task4']);
            expect(results).to.eql({task1: ['task1a','task1b'], task2: 'task2', task3: undefined, task4: 'task4'});
            done();
        });
    });

    it('auto empty object', function(done){
        async.auto({}, function(err){
            expect(err).to.equal(null);
            done();
        });
    });

    it('auto error', function(done){
        async.auto({
            task1: function(callback){
                callback('testerror');
            },
            task2: ['task1', function(/*results, callback*/){
                throw new Error('task2 should not be called');
            }],
            task3: function(callback){
                callback('testerror2');
            }
        },
        function(err){
            expect(err).to.equal('testerror');
        });
        setTimeout(done, 100);
    });

    it('auto no callback', function(done){
        async.auto({
            task1: function(callback){callback();},
            task2: ['task1', function(results, callback){callback(); done();}]
        });
    });

    it('auto concurrency no callback', function(done){
        async.auto({
            task1: function(callback){callback();},
            task2: ['task1', function(results, callback){callback(); done();}]
        }, 1);
    });

    it('auto error should pass partial results', function(done) {
        async.auto({
            task1: function(callback){
                callback(false, 'result1');
            },
            task2: ['task1', function(results, callback){
                callback('testerror', 'result2');
            }],
            task3: ['task2', function(){
                throw new Error('task3 should not be called');
            }]
        },
        function(err, results){
            expect(err).to.equal('testerror');
            expect(results.task1).to.equal('result1');
            expect(results.task2).to.equal('result2');
            done();
        });
    });

    // Issue 24 on github: https://github.com/caolan/async/issues#issue/24
    // Issue 76 on github: https://github.com/caolan/async/issues#issue/76
    it('auto removeListener has side effect on loop iteratee', function(done) {
        async.auto({
            task1: ['task3', function(/*callback*/) { done(); }],
            task2: ['task3', function(/*callback*/) { /* by design: DON'T call callback */ }],
            task3: function(callback) { callback(); }
        });
    });

    // Issue 410 on github: https://github.com/caolan/async/issues/410
    it('auto calls callback multiple times', function(done) {
        var finalCallCount = 0;
        try {
            async.auto({
                task1: function(callback) { callback(null); },
                task2: ['task1', function(results, callback) { callback(null); }]
            },

            // Error throwing final callback. This should only run once
            function() {
                finalCallCount++;
                var e = new Error('An error');
                e._test_error = true;
                throw e;
            });
        } catch (e) {
            if (!e._test_error) {
                throw e;
            }
        }
        setTimeout(function () {
            expect(finalCallCount).to.equal(1);
            done();
        }, 10);
    });


    it('auto calls callback multiple times with parallel functions', function(done) {
        async.auto({
            task1: function(callback) { setTimeout(callback,0,'err'); },
            task2: function(callback) { setTimeout(callback,0,'err'); }
        },
        // Error throwing final callback. This should only run once
        function(err) {
            expect(err).to.equal('err');
            done();
        });
    });


    // Issue 462 on github: https://github.com/caolan/async/issues/462
    it('auto modifying results causes final callback to run early', function(done) {
        async.auto({
            task1: function(callback){
                callback(null, 'task1');
            },
            task2: ['task1', function(results, callback){
                results.inserted = true;
                setTimeout(function(){
                    callback(null, 'task2');
                }, 50);
            }],
            task3: function(callback){
                setTimeout(function(){
                    callback(null, 'task3');
                }, 100);
            }
        },
        function(err, results){
            expect(results.inserted).to.equal(true);
            expect(results.task3).to.equal('task3');
            done();
        });
    });

    // Issue 263 on github: https://github.com/caolan/async/issues/263
    it('auto prevent dead-locks due to inexistant dependencies', function(done) {
        expect(function () {
            async.auto({
                task1: ['noexist', function(results, callback){
                    callback(null, 'task1');
                }]
            });
        }).to.throw(/dependency `noexist`/);
        done();
    });

    // Issue 263 on github: https://github.com/caolan/async/issues/263
    it('auto prevent dead-locks due to cyclic dependencies', function(done) {
        expect(function () {
            async.auto({
                task1: ['task2', function(results, callback){
                    callback(null, 'task1');
                }],
                task2: ['task1', function(results, callback){
                    callback(null, 'task2');
                }]
            });
        }).to.throw();
        done();
    });

    // Issue 1092 on github: https://github.com/caolan/async/issues/1092
    it('extended cycle detection', function(done) {
        var task = function (name) {
            return function (results, callback) {
                callback(null, 'task ' + name);
            };
        };
        expect(function () {
            async.auto({
                a: ['c', task('a')],
                b: ['a', task('b')],
                c: ['b', task('c')]
            });
        }).to.throw();
        done();
    });

    // Issue 988 on github: https://github.com/caolan/async/issues/988
    it('auto stops running tasks on error', function(done) {
        async.auto({
            task1: function (callback) {
                callback('error');
            },
            task2: function (/*callback*/) {
                throw new Error('test2 should not be called');
            }
        }, 1, function (error) {
            expect(error).to.equal('error');
            done();
        });
    });

    it('ignores results after an error', function (done) {
        async.auto({
            task1: function (cb) {
                setTimeout(cb, 25, 'error');
            },
            task2: function (cb) {
                setTimeout(cb, 30, null);
            },
            task3: ['task2', function () {
                throw new Error("task should not have been called");
            }]
        }, function (err) {
            expect(err).to.equal('error');
            setTimeout(done, 25, null);
        });
    });

    it("does not allow calling callbacks twice", function () {
        expect(function () {
            async.auto({
                bad: function (cb) {
                    cb();
                    cb();
                }
            }, function () {});

        }).to.throw();
    });

    it('should handle array tasks with just a function', function (done) {
        async.auto({
            a: [function (cb) {
                cb(null, 1);
            }],
            b: ["a", function (results, cb) {
                expect(results.a).to.equal(1);
                cb();
            }]
        }, done);
    });

    it("should avoid unncecessary deferrals", function (done) {
        var isSync = true;

        async.auto({
            step1: function (cb) { cb(null, 1); },
            step2: ["step1", function (results, cb) {
                cb();
            }]
        }, function () {
            expect(isSync).to.equal(true);
            done();
        });

        isSync = false;
    });

});
