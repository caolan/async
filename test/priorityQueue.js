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
            expect(q.length()).to.equal(3);
            call_order.push('callback ' + 1);
        });
        q.push(2, 0.2, (err, arg) => {
            expect(err).to.equal('error');
            expect(arg).to.equal('arg');
            expect(q.length()).to.equal(4);
            call_order.push('callback ' + 2);
        });
        q.push(3, 3.8, (err, arg) => {
            expect(err).to.equal('error');
            expect(arg).to.equal('arg');
            expect(q.length()).to.equal(0);
            call_order.push('callback ' + 3);
        });
        q.push(['arr', 'arr'], 2.9, (err, arg) => {
            expect(err).to.equal('error');
            expect(arg).to.equal('arg');
            call_order.push('callback arr');
        });
        expect(q.length()).to.equal(5);
        expect(q.concurrency).to.equal(1);

        q.drain(() => {
            expect(call_order).to.eql([
                'process 2', 'callback 2',
                'process 1', 'callback 1',
                'process arr', 'callback arr',
                'process arr', 'callback arr',
                'process 3', 'callback 3'
            ]);
            expect(q.concurrency).to.equal(1);
            expect(q.length()).to.equal(0);
            expect(q.idle()).to.be.equal(true);
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
            expect(q.running()).to.equal(1);
            call_order.push('callback ' + 1);
        });
        q.push(2, 0.2, (err, arg) => {
            expect(err).to.equal('error');
            expect(arg).to.equal('arg');
            expect(q.length()).to.equal(1);
            expect(q.running()).to.equal(1);
            call_order.push('callback ' + 2);
        });
        q.push(3, 3.8, (err, arg) => {
            expect(err).to.equal('error');
            expect(arg).to.equal('arg');
            expect(q.length()).to.equal(0);
            expect(q.running()).to.equal(1);
            call_order.push('callback ' + 3);
        });
        q.push(4, 2.9, (err, arg) => {
            expect(err).to.equal('error');
            expect(arg).to.equal('arg');
            expect(q.length()).to.equal(0);
            expect(q.running()).to.equal(0);
            call_order.push('callback ' + 4);
        });
        expect(q.length()).to.equal(4);
        expect(q.running()).to.equal(0);
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
            expect(q.running()).to.equal(0);
            done();
        });
    });

    it('pushAsync', done => {
        const calls = [];
        const q = async.priorityQueue((task, cb) => {
            if (task === 2) return cb(new Error('fail'));
            cb();
        })

        q.pushAsync(1, 1, () => { throw new Error('should not be called') }).then(() => calls.push(1));
        q.pushAsync(2, 0).catch(err => {
            expect(err.message).to.equal('fail');
            calls.push(2);
        });
        q.pushAsync([3, 4], 0).map(p => p.then(() => calls.push('arr')));
        q.drain(() => setTimeout(() => {
            expect(calls).to.eql([2, 'arr', 'arr', 1]);
            done();
        }));
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

    it('kill', (done) => {
        var q = async.priorityQueue((/*task, callback*/) => {
            setTimeout(() => {
                throw new Error("Function should never be called");
            }, 20);
        }, 1);
        q.drain(() => {
            throw new Error("Function should never be called");
        });

        q.push(0);

        q.kill();

        setTimeout(() => {
            expect(q.length()).to.equal(0);
            done();
        }, 40);
    });

    context('q.workersList():', () => {
        it('should be the same length as running()', (done) => {
            var q = async.priorityQueue((task, cb) => {
                async.setImmediate(() => {
                    expect(q.workersList().length).to.equal(q.running());
                    cb();
                });
            }, 2);

            q.drain(() => {
                expect(q.workersList().length).to.equal(0);
                expect(q.running()).to.equal(0);
                done();
            });

            q.push('foo', 2);
            q.push('bar', 1);
            q.push('baz', 0);
        });

        it('should contain the items being processed', (done) => {
            var itemsBeingProcessed = {
                'foo': [
                    {data: 'bar', priority: 1},
                    {data: 'foo', priority: 2}
                ],
                'foo_cb': [
                    {data: 'foo', priority: 2}
                ],
                'bar': [
                    {data: 'baz', priority: 0},
                    {data: 'bar', priority: 1}
                ],
                'bar_cb': [
                    {data: 'bar', priority: 1},
                    {data: 'foo', priority: 2}
                ],
                'baz': [
                    {data: 'baz', priority: 0}
                ],
                'baz_cb': [
                    {data: 'baz', priority: 0},
                    {data: 'bar', priority: 1}
                ]
            };

            function getWorkersListData(q) {
                return q.workersList().map(({data, priority}) => {
                    return {data, priority};
                });
            }

            var q = async.priorityQueue((task, cb) => {
                expect(
                    getWorkersListData(q)
                ).to.eql(itemsBeingProcessed[task]);
                expect(q.workersList().length).to.equal(q.running());
                async.setImmediate(() => {
                    expect(
                        getWorkersListData(q)
                    ).to.eql(itemsBeingProcessed[task+'_cb']);
                    expect(q.workersList().length).to.equal(q.running());
                    cb();
                });
            }, 2);

            q.drain(() => {
                expect(q.workersList()).to.eql([]);
                expect(q.workersList().length).to.equal(q.running());
                done();
            });

            q.push('foo', 2);
            q.push('bar', 1);
            q.push('baz', 0);
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

    it('should call the drain callback if receives an empty push', (done) => {
        var call_order = [];

        var q = async.priorityQueue((task, callback) => {
            call_order.push(task);
            callback('error', 'arg');
        }, 1);

        q.drain(() => {
            call_order.push('drain')
            expect(call_order).to.eql([
                'drain'
            ]);
            expect(q.length()).to.equal(0);
            expect(q.running()).to.equal(0);
            done();
        });

        q.push([], 1, () => { throw new Error('should not be called') });
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

    it('should be iterable', (done) => {
        var q = async.priorityQueue((data, cb) => {
            if (data === 3) {
                q.push(6)
                expect([...q]).to.eql([4, 5, 6]);
            }
            async.setImmediate(cb);
        });

        q.push([1, 2, 3, 4, 5]);

        expect([...q]).to.eql([1, 2, 3, 4, 5]);

        q.drain(() => {
            expect([...q]).to.eql([]);
            done();
        });
    });

    it('should error when calling unshift', () => {
        var q = async.priorityQueue(() => {});
        expect(() => {
            q.unshift(1);
        }).to.throw();
    });

    it('should error when calling unshiftAsync', () => {
        var q = async.priorityQueue(() => {});
        expect(() => {
            q.unshiftAsync(1);
        }).to.throw();
    });

    it('should error when the callback is called more than once', (done) => {
        var q = async.priorityQueue((task, callback) => {
            callback();
            expect(() => {
                callback();
            }).to.throw();
            done();
        }, 2);

        q.push(1);
    });
});
