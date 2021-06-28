var async = require('../lib');
var {expect} = require('chai');

describe('priorityQueue', () => {

    it('priorityQueue', (done) => {
        var call_order = [];

        // order of completion: 2,1,4,3

        var q = async.priorityQueue((task, callback) => {
            call_order.push('process ' + task);
            callback('error', 'arg');
        }, 1);

        q.push(1, 1.4, (err, arg) => {
            expect(err).to.equal('error');
            expect(arg).to.equal('arg');
            expect(q.length()).to.equal(2);
            call_order.push('callback ' + 1);
        });
        q.push(2, 0.2, (err, arg) => {
            expect(err).to.equal('error');
            expect(arg).to.equal('arg');
            expect(q.length()).to.equal(3);
            call_order.push('callback ' + 2);
        });
        q.push(3, 3.8, (err, arg) => {
            expect(err).to.equal('error');
            expect(arg).to.equal('arg');
            expect(q.length()).to.equal(0);
            call_order.push('callback ' + 3);
        });
        q.push(4, 2.9, (err, arg) => {
            expect(err).to.equal('error');
            expect(arg).to.equal('arg');
            expect(q.length()).to.equal(1);
            call_order.push('callback ' + 4);
        });
        expect(q.length()).to.equal(4);
        expect(q.concurrency).to.equal(1);

        q.drain(() => {
            expect(call_order).to.eql([
                'process 2', 'callback 2',
                'process 1', 'callback 1',
                'process 4', 'callback 4',
                'process 3', 'callback 3'
            ]);
            expect(q.concurrency).to.equal(1);
            expect(q.length()).to.equal(0);
            q.push([])
            expect(q.length()).to.equal(0)
            done()
        });
        try {
            q.push(5, 5, 'NOT_A_FUNCTION')
        } catch(e) {
            expect(e.message).to.equal('task callback must be a function')
        }
    });

    it('concurrency', (done) => {
        var call_order = [],
            delays = [80,20,180,20];

        // worker1: --2-3
        // worker2: -1---4
        // order of completion: 1,2,3,4

        var q = async.priorityQueue((task, callback) => {
            setTimeout(() => {
                call_order.push('process ' + task);
                callback('error', 'arg');
            }, delays.shift());
        }, 2);

        q.push(1, 1.4, (err, arg) => {
            expect(err).to.equal('error');
            expect(arg).to.equal('arg');
            expect(q.length()).to.equal(2);
            call_order.push('callback ' + 1);
        });
        q.push(2, 0.2, (err, arg) => {
            expect(err).to.equal('error');
            expect(arg).to.equal('arg');
            expect(q.length()).to.equal(1);
            call_order.push('callback ' + 2);
        });
        q.push(3, 3.8, (err, arg) => {
            expect(err).to.equal('error');
            expect(arg).to.equal('arg');
            expect(q.length()).to.equal(0);
            call_order.push('callback ' + 3);
        });
        q.push(4, 2.9, (err, arg) => {
            expect(err).to.equal('error');
            expect(arg).to.equal('arg');
            expect(q.length()).to.equal(0);
            call_order.push('callback ' + 4);
        });
        expect(q.length()).to.equal(4);
        expect(q.concurrency).to.equal(2);

        q.drain(() => {
            expect(call_order).to.eql([
                'process 1', 'callback 1',
                'process 2', 'callback 2',
                'process 3', 'callback 3',
                'process 4', 'callback 4'
            ]);
            expect(q.concurrency).to.equal(2);
            expect(q.length()).to.equal(0);
            done();
        });
    });

    it('pause in worker with concurrency', (done) => {
        var call_order = [];
        var q = async.priorityQueue((task, callback) => {
            if (task.isLongRunning) {
                q.pause();
                setTimeout(() => {
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

        q.drain(() => {
            expect(call_order).to.eql([1, 2, 3, 4, 5]);
            done();
        });
    });

    context('q.saturated(): ', () => {
        it('should call the saturated callback if tasks length is concurrency', (done) => {
            var calls = [];
            var q = async.priorityQueue((task, cb) => {
                calls.push('process ' + task);
                async.setImmediate(cb);
            }, 4);
            q.saturated(() => {
                calls.push('saturated');
            });
            q.empty(() => {
                expect(calls.indexOf('saturated')).to.be.above(-1);
                setTimeout(() => {
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
            });
            q.push('foo0', 5, () => {calls.push('foo0 cb');});
            q.push('foo1', 4, () => {calls.push('foo1 cb');});
            q.push('foo2', 3, () => {calls.push('foo2 cb');});
            q.push('foo3', 2, () => {calls.push('foo3 cb');});
            q.push('foo4', 1, () => {calls.push('foo4 cb');});
        });
    });

    context('q.unsaturated(): ',() => {
        it('should have a default buffer property that equals 25% of the concurrenct rate', (done) => {
            var calls = [];
            var q = async.priorityQueue((task, cb) => {
                // nop
                calls.push('process ' + task);
                async.setImmediate(cb);
            }, 10);
            expect(q.buffer).to.equal(2.5);
            done();
        });

        it('should allow a user to change the buffer property', (done) => {
            var calls = [];
            var q = async.priorityQueue((task, cb) => {
                // nop
                calls.push('process ' + task);
                async.setImmediate(cb);
            }, 10);
            q.buffer = 4;
            expect(q.buffer).to.not.equal(2.5);
            expect(q.buffer).to.equal(4);
            done();
        });

        it('should call the unsaturated callback if tasks length is less than concurrency minus buffer', (done) => {
            var calls = [];
            var q = async.priorityQueue((task, cb) => {
                calls.push('process ' + task);
                setTimeout(cb, 10);
            }, 4);
            q.unsaturated(() => {
                calls.push('unsaturated');
            });
            q.empty(() => {
                expect(calls.indexOf('unsaturated')).to.be.above(-1);
                setTimeout(() => {
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
            });
            q.push('foo0', 5, () => {calls.push('foo0 cb');});
            q.push('foo1', 4, () => {calls.push('foo1 cb');});
            q.push('foo2', 3, () => {calls.push('foo2 cb');});
            q.push('foo3', 2, () => {calls.push('foo3 cb');});
            q.push('foo4', 1, () => {calls.push('foo4 cb');});
        });
    });

    it('should not call the drain callback if receives empty push and tasks are still pending', (done) => {
        var call_order = [];

        var q = async.priorityQueue((task, callback) => {
            call_order.push('process ' + task);
            callback('error', 'arg');
        }, 1);

        q.push(1, 1, (err, arg) => {
            expect(err).to.equal('error');
            expect(arg).to.equal('arg');
            call_order.push('callback ' + 1);
        });

        q.push(2, 1, (err, arg) => {
            expect(err).to.equal('error');
            expect(arg).to.equal('arg');
            call_order.push('callback ' + 2);
        });

        expect(q.length()).to.equal(2);

        q.drain(() => {
            expect(call_order).to.eql([
                'process 1', 'callback 1',
                'process 2', 'callback 2'
            ]);
            expect(q.concurrency).to.equal(1);
            expect(q.length()).to.equal(0);
            expect(q.running()).to.equal(0);
            done();
        });

        q.push([], 1, () => {});
    });
});
