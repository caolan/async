var async = require('../lib');
var expect = require('chai').expect;

describe('priorityQueue', function() {

    it('priorityQueue', function (done) {
        var call_order = [];

        // order of completion: 2,1,4,3

        var q = async.priorityQueue(function (task, callback) {
            call_order.push('process ' + task);
            callback('error', 'arg');
        }, 1);

        q.push(1, 1.4, function (err, arg) {
            expect(err).to.equal('error');
            expect(arg).to.equal('arg');
            expect(q.length()).to.equal(2);
            call_order.push('callback ' + 1);
        });
        q.push(2, 0.2, function (err, arg) {
            expect(err).to.equal('error');
            expect(arg).to.equal('arg');
            expect(q.length()).to.equal(3);
            call_order.push('callback ' + 2);
        });
        q.push(3, 3.8, function (err, arg) {
            expect(err).to.equal('error');
            expect(arg).to.equal('arg');
            expect(q.length()).to.equal(0);
            call_order.push('callback ' + 3);
        });
        q.push(4, 2.9, function (err, arg) {
            expect(err).to.equal('error');
            expect(arg).to.equal('arg');
            expect(q.length()).to.equal(1);
            call_order.push('callback ' + 4);
        });
        expect(q.length()).to.equal(4);
        expect(q.concurrency).to.equal(1);

        q.drain = function () {
            expect(call_order).to.eql([
                'process 2', 'callback 2',
                'process 1', 'callback 1',
                'process 4', 'callback 4',
                'process 3', 'callback 3'
            ]);
            expect(q.concurrency).to.equal(1);
            expect(q.length()).to.equal(0);
            done();
        };
    });

    it('concurrency', function (done) {
        var call_order = [],
            delays = [160,80,240,80];

        // worker1: --2-3
        // worker2: -1---4
        // order of completion: 1,2,3,4

        var q = async.priorityQueue(function (task, callback) {
            setTimeout(function () {
                call_order.push('process ' + task);
                callback('error', 'arg');
            }, delays.splice(0,1)[0]);
        }, 2);

        q.push(1, 1.4, function (err, arg) {
            expect(err).to.equal('error');
            expect(arg).to.equal('arg');
            expect(q.length()).to.equal(2);
            call_order.push('callback ' + 1);
        });
        q.push(2, 0.2, function (err, arg) {
            expect(err).to.equal('error');
            expect(arg).to.equal('arg');
            expect(q.length()).to.equal(1);
            call_order.push('callback ' + 2);
        });
        q.push(3, 3.8, function (err, arg) {
            expect(err).to.equal('error');
            expect(arg).to.equal('arg');
            expect(q.length()).to.equal(0);
            call_order.push('callback ' + 3);
        });
        q.push(4, 2.9, function (err, arg) {
            expect(err).to.equal('error');
            expect(arg).to.equal('arg');
            expect(q.length()).to.equal(0);
            call_order.push('callback ' + 4);
        });
        expect(q.length()).to.equal(4);
        expect(q.concurrency).to.equal(2);

        q.drain = function () {
            expect(call_order).to.eql([
                'process 1', 'callback 1',
                'process 2', 'callback 2',
                'process 3', 'callback 3',
                'process 4', 'callback 4'
            ]);
            expect(q.concurrency).to.equal(2);
            expect(q.length()).to.equal(0);
            done();
        };
    });

    it('pause in worker with concurrency', function(done) {
        var call_order = [];
        var q = async.priorityQueue(function (task, callback) {
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

    context('q.saturated(): ', function() {
        it('should call the saturated callback if tasks length is concurrency', function(done) {
            var calls = [];
            var q = async.priorityQueue(function(task, cb) {
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
                        'process foo4',
                        'process foo3',
                        'process foo2',
                        "saturated",
                        'process foo1',
                        'foo4 cb',
                        "saturated",
                        'process foo0',
                        'foo3 cb',
                        'foo2 cb',
                        'foo1 cb',
                        'foo0 cb'
                    ]);
                    done();
                }, 50);
            };
            q.push('foo0', 5, function () {calls.push('foo0 cb');});
            q.push('foo1', 4, function () {calls.push('foo1 cb');});
            q.push('foo2', 3, function () {calls.push('foo2 cb');});
            q.push('foo3', 2, function () {calls.push('foo3 cb');});
            q.push('foo4', 1, function () {calls.push('foo4 cb');});
        });
    });

    context('q.unsaturated(): ',function() {
        it('should have a default buffer property that equals 25% of the concurrenct rate', function(done) {
            var calls = [];
            var q = async.priorityQueue(function(task, cb) {
                // nop
                calls.push('process ' + task);
                async.setImmediate(cb);
            }, 10);
            expect(q.buffer).to.equal(2.5);
            done();
        });

        it('should allow a user to change the buffer property', function(done) {
            var calls = [];
            var q = async.priorityQueue(function(task, cb) {
                // nop
                calls.push('process ' + task);
                async.setImmediate(cb);
            }, 10);
            q.buffer = 4;
            expect(q.buffer).to.not.equal(2.5);
            expect(q.buffer).to.equal(4);
            done();
        });

        it('should call the unsaturated callback if tasks length is less than concurrency minus buffer', function(done) {
            var calls = [];
            var q = async.priorityQueue(function(task, cb) {
                calls.push('process ' + task);
                setTimeout(cb, 10);
            }, 4);
            q.unsaturated = function() {
                calls.push('unsaturated');
            };
            q.empty = function() {
                expect(calls.indexOf('unsaturated')).to.be.above(-1);
                setTimeout(function() {
                    expect(calls).eql([
                        'process foo4',
                        'process foo3',
                        'process foo2',
                        'process foo1',
                        'foo4 cb',
                        'unsaturated',
                        'process foo0',
                        'foo3 cb',
                        'unsaturated',
                        'foo2 cb',
                        'unsaturated',
                        'foo1 cb',
                        'unsaturated',
                        'foo0 cb',
                        'unsaturated'
                    ]);
                    done();
                }, 50);
            };
            q.push('foo0', 5, function () {calls.push('foo0 cb');});
            q.push('foo1', 4, function () {calls.push('foo1 cb');});
            q.push('foo2', 3, function () {calls.push('foo2 cb');});
            q.push('foo3', 2, function () {calls.push('foo3 cb');});
            q.push('foo4', 1, function () {calls.push('foo4 cb');});
        });
    });
});

