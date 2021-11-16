var async = require('../lib/index.js');
var {expect} = require('chai');
var _ = require('lodash');

describe('auto', () => {

    it('basics', (done) => {
        var callOrder = [];
        async.auto({
            task1: ['task2', function(results, callback){
                setTimeout(() => {
                    callOrder.push('task1');
                    callback();
                }, 25);
            }],
            task2(callback){
                setTimeout(() => {
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
                setTimeout(() => {
                    callOrder.push('task5');
                    callback();
                }, 0);
            }],
            task6: ['task2', function(results, callback){
                callOrder.push('task6');
                callback();
            }]
        },
        (err) => {
            expect(err).to.equal(null);
            expect(callOrder).to.eql(['task2','task3','task6','task5','task1','task4']);
            done();
        });
    });

    it('auto concurrency', (done) => {
        var concurrency = 2;
        var runningTasks = [];

        function makeCallback(taskName) {
            return function(...args/*..., callback*/) {
                var callback = _.last(args);
                runningTasks.push(taskName);
                setTimeout(() => {
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
        }, concurrency, (err, results) => {
            Object.values(results).forEach((result) => {
                expect(result.length).to.be.below(concurrency + 1);
            });
            done();
        });
    });

    it('auto petrify', (done) => {
        var callOrder = [];
        async.auto({
            task1: ['task2', function (results, callback) {
                setTimeout(() => {
                    callOrder.push('task1');
                    callback();
                }, 100);
            }],
            task2 (callback) {
                setTimeout(() => {
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
        (err) => {
            if (err) throw err;
            expect(callOrder).to.eql(['task2', 'task3', 'task1', 'task4']);
            done();
        });
    });

    it('auto results', (done) => {
        var callOrder = [];
        async.auto({
            task1: ['task2', function(results, callback){
                expect(results.task2).to.eql('task2');
                setTimeout(() => {
                    callOrder.push('task1');
                    callback(null, 'task1a', 'task1b');
                }, 25);
            }],
            task2(callback){
                setTimeout(() => {
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
        (err, results) => {
            expect(callOrder).to.eql(['task2','task3','task1','task4']);
            expect(results).to.eql({task1: ['task1a','task1b'], task2: 'task2', task3: undefined, task4: 'task4'});
            done();
        });
    });

    it('auto empty object', (done) => {
        async.auto({}, (err) => {
            expect(err).to.equal(null);
            done();
        });
    });

    it('auto error', (done) => {
        async.auto({
            task1(callback){
                callback('testerror');
            },
            task2: ['task1', function(/*results, callback*/){
                throw new Error('task2 should not be called');
            }],
            task3(callback){
                callback('testerror2');
            }
        },
        (err) => {
            expect(err).to.equal('testerror');
        });
        setTimeout(done, 100);
    });

    it('auto canceled', (done) => {
        const call_order = []
        async.auto({
            task1(callback){
                call_order.push(1)
                callback(false);
            },
            task2: ['task1', function(/*results, callback*/){
                call_order.push(2)
                throw new Error('task2 should not be called');
            }],
            task3(callback){
                call_order.push(3)
                callback('testerror2');
            }
        },
        () => {
            throw new Error('should not get here')
        });
        setTimeout(() => {
            expect(call_order).to.eql([1, 3])
            done()
        }, 10);
    });

    it('does not start other tasks when it has been canceled', (done) => {
        const call_order = []
        async.auto({
            task1(callback) {
                call_order.push(1);
                // defer calling task2, so task3 has time to stop execution
                async.setImmediate(callback);
            },
            task2: ['task1', function( /*results, callback*/ ) {
                call_order.push(2);
                throw new Error('task2 should not be called');
            }],
            task3(callback) {
                call_order.push(3);
                callback(false);
            },
            task4: ['task3', function( /*results, callback*/ ) {
                call_order.push(4);
                throw new Error('task4 should not be called');
            }]
        },
        () => {
            throw new Error('should not get here')
        });

        setTimeout(() => {
            expect(call_order).to.eql([1, 3])
            done()
        }, 25)
    });

    it('auto no callback', (done) => {
        async.auto({
            task1(callback){callback();},
            task2: ['task1', function(results, callback){callback(); done();}]
        });
    });

    it('auto concurrency no callback', (done) => {
        async.auto({
            task1(callback){callback();},
            task2: ['task1', function(results, callback){callback(); done();}]
        }, 1);
    });

    it('auto error should pass partial results', (done) => {
        async.auto({
            task1(callback){
                callback(null, 'result1');
            },
            task2: ['task1', function(results, callback){
                callback('testerror', 'result2');
            }],
            task3: ['task2', function(){
                throw new Error('task3 should not be called');
            }]
        },
        (err, results) => {
            expect(err).to.equal('testerror');
            expect(results.task1).to.equal('result1');
            expect(results.task2).to.equal('result2');
            done();
        });
    });

    // Issue 24 on github: https://github.com/caolan/async/issues#issue/24
    // Issue 76 on github: https://github.com/caolan/async/issues#issue/76
    it('auto removeListener has side effect on loop iteratee', (done) => {
        async.auto({
            task1: ['task3', function(/*callback*/) { done(); }],
            task2: ['task3', function(/*callback*/) { /* by design: DON'T call callback */ }],
            task3(callback) { callback(); }
        });
    });

    // Issue 410 on github: https://github.com/caolan/async/issues/410
    it('auto calls callback multiple times', (done) => {
        var finalCallCount = 0;
        try {
            async.auto({
                task1(callback) { callback(null); },
                task2: ['task1', function(results, callback) { callback(null); }]
            },

            // Error throwing final callback. This should only run once
            () => {
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
        setTimeout(() => {
            expect(finalCallCount).to.equal(1);
            done();
        }, 10);
    });


    it('auto calls callback multiple times with parallel functions', (done) => {
        async.auto({
            task1(callback) { setTimeout(callback,0,'err'); },
            task2(callback) { setTimeout(callback,0,'err'); }
        },
        // Error throwing final callback. This should only run once
        (err) => {
            expect(err).to.equal('err');
            done();
        });
    });


    // Issue 462 on github: https://github.com/caolan/async/issues/462
    it('auto modifying results causes final callback to run early', (done) => {
        async.auto({
            task1(callback){
                callback(null, 'task1');
            },
            task2: ['task1', function(results, callback){
                results.inserted = true;
                setTimeout(() => {
                    callback(null, 'task2');
                }, 50);
            }],
            task3(callback){
                setTimeout(() => {
                    callback(null, 'task3');
                }, 100);
            }
        },
        (err, results) => {
            expect(results.inserted).to.equal(true);
            expect(results.task3).to.equal('task3');
            done();
        });
    });

    // Issue 263 on github: https://github.com/caolan/async/issues/263
    it('auto prevent dead-locks due to inexistant dependencies', (done) => {
        expect(() => {
            async.auto({
                task1: ['noexist', function(results, callback){
                    callback(null, 'task1');
                }]
            });
        }).to.throw(/dependency `noexist`/);
        done();
    });

    // Issue 263 on github: https://github.com/caolan/async/issues/263
    it('auto prevent dead-locks due to cyclic dependencies', (done) => {
        expect(() => {
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
    it('extended cycle detection', (done) => {
        var task = function (name) {
            return function (results, callback) {
                callback(null, 'task ' + name);
            };
        };
        expect(() => {
            async.auto({
                a: ['c', task('a')],
                b: ['a', task('b')],
                c: ['b', task('c')]
            });
        }).to.throw();
        done();
    });

    // Issue 988 on github: https://github.com/caolan/async/issues/988
    it('auto stops running tasks on error', (done) => {
        async.auto({
            task1 (callback) {
                callback('error');
            },
            task2 (/*callback*/) {
                throw new Error('test2 should not be called');
            }
        }, 1, (error) => {
            expect(error).to.equal('error');
            done();
        });
    });

    it('ignores results after an error', (done) => {
        async.auto({
            task1 (cb) {
                setTimeout(cb, 25, 'error');
            },
            task2 (cb) {
                setTimeout(cb, 30, null);
            },
            task3: ['task2', function () {
                throw new Error("task should not have been called");
            }]
        }, (err) => {
            expect(err).to.equal('error');
            setTimeout(done, 25, null);
        });
    });

    it("does not allow calling callbacks twice", () => {
        expect(() => {
            async.auto({
                bad (cb) {
                    cb();
                    cb();
                }
            }, () => {});

        }).to.throw();
    });

    it('should handle array tasks with just a function', (done) => {
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

    it("should avoid unncecessary deferrals", (done) => {
        var isSync = true;

        async.auto({
            step1 (cb) { cb(null, 1); },
            step2: ["step1", function (results, cb) {
                cb();
            }]
        }, () => {
            expect(isSync).to.equal(true);
            done();
        });

        isSync = false;
    });

    // Issue 1358 on github: https://github.com/caolan/async/issues/1358
    it('should report errors when a task name is an array method', (done) => {
        async.auto({
            'one' (next) {
                next('Something bad happened here');
            },
            'filter' (next) {
                setTimeout(() => {
                    next(null, 'All fine here though');
                }, 25);
            },
            'finally': ['one', 'filter', function (a, next) {
                _.defer(next);
            }]
        }, (err) => {
            expect(err).to.equal('Something bad happened here');
            setTimeout(done, 30);
        });
    });

    it('should report errors when a task name is an obj prototype method', (done) => {
        async.auto({
            'one' (next) {
                next('Something bad happened here');
            },
            'hasOwnProperty' (next) {
                setTimeout(() => {
                    next(null, 'All fine here though');
                }, 25);
            },
            'finally': ['one', 'hasOwnProperty', function (a, next) {
                _.defer(next);
            }]
        }, (err) => {
            expect(err).to.equal('Something bad happened here');
            setTimeout(done, 30);
        });
    });

});
