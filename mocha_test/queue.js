var async = require('../lib');
var expect = require('chai').expect;
var assert = require('assert');


describe('queue', function(){
    // several tests of these tests are flakey with timing issues
    this.retries(3);

    it('basics', function(done) {

        var call_order = [];
        var delays = [40,20,60,20];


        // worker1: --1-4
        // worker2: -2---3
        // order of completion: 2,1,4,3

        var q = async.queue(function (task, callback) {
            setTimeout(function () {
                call_order.push('process ' + task);
                callback('error', 'arg');
            }, delays.shift());
        }, 2);

        q.push(1, function (err, arg) {
            expect(err).to.equal('error');
            expect(arg).to.equal('arg');
            expect(q.length()).to.equal(1);
            call_order.push('callback ' + 1);
        });
        q.push(2, function (err, arg) {
            expect(err).to.equal('error');
            expect(arg).to.equal('arg');
            expect(q.length()).to.equal(2);
            call_order.push('callback ' + 2);
        });
        q.push(3, function (err, arg) {
            expect(err).to.equal('error');
            expect(arg).to.equal('arg');
            expect(q.length()).to.equal(0);
            call_order.push('callback ' + 3);
        });
        q.push(4, function (err, arg) {
            expect(err).to.equal('error');
            expect(arg).to.equal('arg');
            expect(q.length()).to.equal(0);
            call_order.push('callback ' + 4);
        });
        expect(q.length()).to.equal(4);
        expect(q.concurrency).to.equal(2);

        q.drain = function () {
            expect(call_order).to.eql([
                'process 2', 'callback 2',
                'process 1', 'callback 1',
                'process 4', 'callback 4',
                'process 3', 'callback 3'
            ]);
            expect(q.concurrency).to.equal(2);
            expect(q.length()).to.equal(0);
            done();
        };
    });

    it('default concurrency', function(done) {
        var call_order = [],
            delays = [40,20,60,20];

        // order of completion: 1,2,3,4

        var q = async.queue(function (task, callback) {
            setTimeout(function () {
                call_order.push('process ' + task);
                callback('error', 'arg');
            }, delays.shift());
        });

        q.push(1, function (err, arg) {
            expect(err).to.equal('error');
            expect(arg).to.equal('arg');
            expect(q.length()).to.equal(3);
            call_order.push('callback ' + 1);
        });
        q.push(2, function (err, arg) {
            expect(err).to.equal('error');
            expect(arg).to.equal('arg');
            expect(q.length()).to.equal(2);
            call_order.push('callback ' + 2);
        });
        q.push(3, function (err, arg) {
            expect(err).to.equal('error');
            expect(arg).to.equal('arg');
            expect(q.length()).to.equal(1);
            call_order.push('callback ' + 3);
        });
        q.push(4, function (err, arg) {
            expect(err).to.equal('error');
            expect(arg).to.equal('arg');
            expect(q.length()).to.equal(0);
            call_order.push('callback ' + 4);
        });
        expect(q.length()).to.equal(4);
        expect(q.concurrency).to.equal(1);

        q.drain = function () {
            expect(call_order).to.eql([
                'process 1', 'callback 1',
                'process 2', 'callback 2',
                'process 3', 'callback 3',
                'process 4', 'callback 4'
            ]);
            expect(q.concurrency).to.equal(1);
            expect(q.length()).to.equal(0);
            done();
        };
    });

    it('zero concurrency', function(done){
        expect(function () {
            async.queue(function (task, callback) {
                callback(null, task);
            }, 0);
        }).to.throw();
        done();
    });

    it('error propagation', function(done){
        var results = [];

        var q = async.queue(function (task, callback) {
            callback(task.name === 'foo' ? new Error('fooError') : null);
        }, 2);

        q.drain = function() {
            expect(results).to.eql(['bar', 'fooError']);
            done();
        };

        q.push({name: 'bar'}, function (err) {
            if(err) {
                results.push('barError');
                return;
            }

            results.push('bar');
        });

        q.push({name: 'foo'}, function (err) {
            if(err) {
                results.push('fooError');
                return;
            }

            results.push('foo');
        });
    });

    it('global error handler', function(done){
        var results = [];

        var q = async.queue(function (task, callback) {
            callback(task.name === 'foo' ? new Error('fooError') : null);
        }, 2);

        q.error = function(error, task) {
            expect(error).to.exist;
            expect(error.message).to.equal('fooError');
            expect(task.name).to.equal('foo');
            results.push('fooError');
        };

        q.drain = function() {
            expect(results).to.eql(['fooError', 'bar']);
            done();
        };

        q.push({name: 'foo'});

        q.push({name: 'bar'}, function(error) {
            expect(error).to.not.exist;
            results.push('bar');
        });
    });

    // The original queue implementation allowed the concurrency to be changed only
    // on the same event loop during which a task was added to the queue. This
    // test attempts to be a more robust test.
    // Start with a concurrency of 1. Wait until a leter event loop and change
    // the concurrency to 2. Wait again for a later loop then verify the concurrency
    // Repeat that one more time by chaning the concurrency to 5.
    it('changing concurrency', function(done) {

        var q = async.queue(function(task, callback){
            setTimeout(function(){
                callback();
            }, 10);
        }, 1);

        for(var i = 0; i < 50; i++){
            q.push('');
        }

        q.drain = function(){
            done();
        };

        setTimeout(function(){
            expect(q.concurrency).to.equal(1);
            q.concurrency = 2;
            setTimeout(function(){
                expect(q.running()).to.equal(2);
                q.concurrency = 5;
                setTimeout(function(){
                    expect(q.running()).to.equal(5);
                }, 40);
            }, 40);
        }, 40);
    });

    it('push without callback', function(done) {
        this.retries(3); // test can be flakey

        var call_order = [],
            delays = [40,20,60,20];

        // worker1: --1-4
        // worker2: -2---3
        // order of completion: 2,1,4,3

        var q = async.queue(function (task, callback) {
            setTimeout(function () {
                call_order.push('process ' + task);
                callback('error', 'arg');
            }, delays.shift());
        }, 2);

        q.push(1);
        q.push(2);
        q.push(3);
        q.push(4);

        q.drain = function () {
            expect(call_order).to.eql([
                'process 2',
                'process 1',
                'process 4',
                'process 3'
            ]);
            done();
        };
    });

    it('push with non-function', function(done) {
        var q = async.queue(function () {}, 1);
        expect(function () {
            q.push({}, 1);
        }).to.throw();
        done();
    });

    it('unshift', function(done) {
        var queue_order = [];

        var q = async.queue(function (task, callback) {
            queue_order.push(task);
            callback();
        }, 1);

        q.unshift(4);
        q.unshift(3);
        q.unshift(2);
        q.unshift(1);

        setTimeout(function () {
            expect(queue_order).to.eql([ 1, 2, 3, 4 ]);
            done();
        }, 100);
    });

    it('too many callbacks', function(done) {
        var q = async.queue(function (task, callback) {
            callback();
            expect(function() {
                callback();
            }).to.throw();
            done();
        }, 2);

        q.push(1);
    });

    it('bulk task', function(done) {
        var call_order = [],
            delays = [40,20,60,20];

        // worker1: --1-4
        // worker2: -2---3
        // order of completion: 2,1,4,3

        var q = async.queue(function (task, callback) {
            setTimeout(function () {
                call_order.push('process ' + task);
                callback('error', task);
            }, delays.splice(0,1)[0]);
        }, 2);

        q.push( [1,2,3,4], function (err, arg) {
            expect(err).to.equal('error');
            call_order.push('callback ' + arg);
        });

        expect(q.length()).to.equal(4);
        expect(q.concurrency).to.equal(2);

        q.drain = function () {
            expect(call_order).to.eql([
                'process 2', 'callback 2',
                'process 1', 'callback 1',
                'process 4', 'callback 4',
                'process 3', 'callback 3'
            ]);
            expect(q.concurrency).to.equal(2);
            expect(q.length()).to.equal(0);
            done();
        };
    });

    it('idle', function(done) {
        var q = async.queue(function (task, callback) {
            // Queue is busy when workers are running
            expect(q.idle()).to.equal(false);
            callback();
        }, 1);

        // Queue is idle before anything added
        expect(q.idle()).to.equal(true);

        q.unshift(4);
        q.unshift(3);
        q.unshift(2);
        q.unshift(1);

        // Queue is busy when tasks added
        expect(q.idle()).to.equal(false);

        q.drain = function() {
            // Queue is idle after drain
            expect(q.idle()).to.equal(true);
            done();
        };
    });

    it('pause', function(done) {
        this.retries(3); // sometimes can be flakey to timing issues

        var call_order = [],
            task_timeout = 80,
            pause_timeout = task_timeout * 2.5,
            resume_timeout = task_timeout * 4.5,
            tasks = [ 1, 2, 3, 4, 5, 6 ],

            elapsed = (function () {
                var start = Date.now();
                return function () {
                    return Math.round((Date.now() - start) / task_timeout) * task_timeout;
                };
            })();

        var q = async.queue(function (task, callback) {
            call_order.push('process ' + task);
            call_order.push('timeout ' + elapsed());
            callback();
        });

        function pushTask () {
            var task = tasks.shift();
            if (!task) { return; }
            setTimeout(function () {
                q.push(task);
                pushTask();
            }, task_timeout);
        }
        pushTask();

        setTimeout(function () {
            q.pause();
            expect(q.paused).to.equal(true);
        }, pause_timeout);

        setTimeout(function () {
            q.resume();
            expect(q.paused).to.equal(false);
        }, resume_timeout);

        setTimeout(function () {
            expect(call_order).to.eql([
                'process 1', 'timeout ' + task_timeout,
                'process 2', 'timeout ' + task_timeout * 2,
                'process 3', 'timeout ' + task_timeout * 5,
                'process 4', 'timeout ' + task_timeout * 5,
                'process 5', 'timeout ' + task_timeout * 5,
                'process 6', 'timeout ' + task_timeout * 6
            ]);
            done();
        }, (task_timeout * tasks.length) + pause_timeout + resume_timeout);
    });

    it('pause in worker with concurrency', function(done) {
        var call_order = [];
        var q = async.queue(function (task, callback) {
            if (task.isLongRunning) {
                q.pause();
                setTimeout(function () {
                    call_order.push(task.id);
                    q.resume();
                    callback();
                }, 50);
            }
            else {
                call_order.push(task.id);
                setTimeout(callback, 10);
            }
        }, 10);

        q.push({ id: 1, isLongRunning: true});
        q.push({ id: 2 });
        q.push({ id: 3 });
        q.push({ id: 4 });
        q.push({ id: 5 });

        q.drain = function () {
            expect(call_order).to.eql([1, 2, 3, 4, 5]);
            done();
        };
    });

    it('pause with concurrency', function(done) {
        var call_order = [],
            task_timeout = 40,
            pause_timeout = task_timeout / 2,
            resume_timeout = task_timeout * 2.75,
            tasks = [ 1, 2, 3, 4, 5, 6 ],

            elapsed = (function () {
                var start = Date.now();
                return function () {
                    return Math.round((Date.now() - start) / task_timeout) * task_timeout;
                };
            })();

        var q = async.queue(function (task, callback) {
            setTimeout(function () {
                call_order.push('process ' + task);
                call_order.push('timeout ' + elapsed());
                callback();
            }, task_timeout);
        }, 2);

        q.push(tasks);

        setTimeout(function () {
            q.pause();
            expect(q.paused).to.equal(true);
        }, pause_timeout);

        setTimeout(function () {
            q.resume();
            expect(q.paused).to.equal(false);
        }, resume_timeout);

        setTimeout(function () {
            expect(q.running()).to.equal(2);
        }, resume_timeout + 10);

        setTimeout(function () {
            expect(call_order).to.eql([
                'process 1', 'timeout ' + task_timeout,
                'process 2', 'timeout ' + task_timeout,
                'process 3', 'timeout ' + task_timeout * 4,
                'process 4', 'timeout ' + task_timeout * 4,
                'process 5', 'timeout ' + task_timeout * 5,
                'process 6', 'timeout ' + task_timeout * 5
            ]);
            done();
        }, (task_timeout * tasks.length) + pause_timeout + resume_timeout);
    });

    it('start paused', function(done) {
        var q = async.queue(function (task, callback) {
            setTimeout(function () {
                callback();
            }, 40);
        }, 2);
        q.pause();

        q.push([1, 2, 3]);

        setTimeout(function () {
            q.resume();
        }, 5);

        setTimeout(function () {
            expect(q._tasks.length).to.equal(1);
            expect(q.running()).to.equal(2);
            q.resume();
        }, 15);

        q.drain = function () {
            done();
        };
    });

    it('kill', function(done) {
        var q = async.queue(function (/*task, callback*/) {
            setTimeout(function () {
                throw new Error("Function should never be called");
            }, 20);
        }, 1);
        q.drain = function() {
            throw new Error("Function should never be called");
        };

        q.push(0);

        q.kill();

        setTimeout(function() {
            expect(q.length()).to.equal(0);
            done();
        }, 40);
    });

    it('events', function(done) {
        var calls = [];
        var q = async.queue(function(task, cb) {
            // nop
            calls.push('process ' + task);
            setTimeout(cb, 10);
        }, 3);
        q.concurrency = 3;

        q.saturated = function() {
            assert(q.running() == 3, 'queue should be saturated now');
            calls.push('saturated');
        };
        q.empty = function() {
            assert(q.length() === 0, 'queue should be empty now');
            calls.push('empty');
        };
        q.drain = function() {
            assert(
                q.length() === 0 && q.running() === 0,
                'queue should be empty now and no more workers should be running'
            );
            calls.push('drain');
            expect(calls).to.eql([
                'process foo',
                'process bar',
                'saturated',
                'process zoo',
                'foo cb',
                'saturated',
                'process poo',
                'bar cb',
                'empty',
                'saturated',
                'process moo',
                'zoo cb',
                'poo cb',
                'moo cb',
                'drain'
            ]);
            done();
        };
        q.push('foo', function () {calls.push('foo cb');});
        q.push('bar', function () {calls.push('bar cb');});
        q.push('zoo', function () {calls.push('zoo cb');});
        q.push('poo', function () {calls.push('poo cb');});
        q.push('moo', function () {calls.push('moo cb');});
    });

    it('empty', function(done) {
        var calls = [];
        var q = async.queue(function(task, cb) {
            // nop
            calls.push('process ' + task);
            async.setImmediate(cb);
        }, 3);

        q.drain = function() {
            assert(
                q.length() === 0 && q.running() === 0,
                'queue should be empty now and no more workers should be running'
            );
            calls.push('drain');
            expect(calls).to.eql([
                'drain'
            ]);
            done();
        };
        q.push([]);
    });

    it('saturated', function(done) {
        var saturatedCalled = false;
        var q = async.queue(function(task, cb) {
            async.setImmediate(cb);
        }, 2);

        q.saturated = function () {
            saturatedCalled = true;
        };
        q.drain = function () {
            assert(saturatedCalled, "saturated not called");
            done();
        };

        q.push(['foo', 'bar', 'baz', 'moo']);
    });

    it('started', function(done) {

        var q = async.queue(function(task, cb) {
            cb(null, task);
        });

        expect(q.started).to.equal(false);
        q.push([]);
        expect(q.started).to.equal(true);
        done();
    });

    context('q.saturated(): ', function() {
        it('should call the saturated callback if tasks length is concurrency', function(done) {
            var calls = [];
            var q = async.queue(function(task, cb) {
                calls.push('process ' + task);
                async.setImmediate(cb);
            }, 4);
            q.saturated = function() {
                calls.push('saturated');
            };
            q.empty = function() {
                expect(calls.indexOf('saturated')).to.be.above(-1);
                setTimeout(function() {
                    expect(calls).eql([
                        'process foo0',
                        'process foo1',
                        'process foo2',
                        "saturated",
                        'process foo3',
                        'foo0 cb',
                        "saturated",
                        'process foo4',
                        'foo1 cb',
                        'foo2 cb',
                        'foo3 cb',
                        'foo4 cb'
                    ]);
                    done();
                }, 50);
            };
            q.push('foo0', function () {calls.push('foo0 cb');});
            q.push('foo1', function () {calls.push('foo1 cb');});
            q.push('foo2', function () {calls.push('foo2 cb');});
            q.push('foo3', function () {calls.push('foo3 cb');});
            q.push('foo4', function () {calls.push('foo4 cb');});
        });
    });

    context('q.unsaturated(): ',function() {
        it('should have a default buffer property that equals 25% of the concurrenct rate', function(done){
            var calls = [];
            var q = async.queue(function(task, cb) {
                // nop
                calls.push('process ' + task);
                async.setImmediate(cb);
            }, 10);
            expect(q.buffer).to.equal(2.5);
            done();
        });
        it('should allow a user to change the buffer property', function(done){
            var calls = [];
            var q = async.queue(function(task, cb) {
                // nop
                calls.push('process ' + task);
                async.setImmediate(cb);
            }, 10);
            q.buffer = 4;
            expect(q.buffer).to.not.equal(2.5);
            expect(q.buffer).to.equal(4);
            done();
        });
        it('should call the unsaturated callback if tasks length is less than concurrency minus buffer', function(done){
            var calls = [];
            var q = async.queue(function(task, cb) {
                calls.push('process ' + task);
                async.setImmediate(cb);
            }, 4);
            q.unsaturated = function() {
                calls.push('unsaturated');
            };
            q.empty = function() {
                expect(calls.indexOf('unsaturated')).to.be.above(-1);
                setTimeout(function() {
                    expect(calls).eql([
                        'process foo0',
                        'process foo1',
                        'process foo2',
                        'process foo3',
                        'foo0 cb',
                        'unsaturated',
                        'process foo4',
                        'foo1 cb',
                        'unsaturated',
                        'foo2 cb',
                        'unsaturated',
                        'foo3 cb',
                        'unsaturated',
                        'foo4 cb',
                        'unsaturated'
                    ]);
                    done();
                }, 50);
            };
            q.push('foo0', function () {calls.push('foo0 cb');});
            q.push('foo1', function () {calls.push('foo1 cb');});
            q.push('foo2', function () {calls.push('foo2 cb');});
            q.push('foo3', function () {calls.push('foo3 cb');});
            q.push('foo4', function () {calls.push('foo4 cb');});
        });
    });
});

