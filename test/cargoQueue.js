var async = require('../lib');
var {expect} = require('chai');
var assert = require('assert');

describe('cargoQueue', () => {

    function worker (tasks, callback) {
        this.call_order.push('process ' + tasks.join(' '));
        callback('error', 'arg');
    }

    it('cargoQueue', (done) => {
        var call_order = [],
            delays = [50, 50, 50];

        // worker: --12--34--5-
        // order of completion: 1,2,3,4,5

        var c = async.cargoQueue((tasks, callback) => {
            if (tasks[0] === 1) {
                c.push(3, (err, arg) => {
                    expect(err).to.equal('error');
                    expect(arg).to.equal('arg');
                    expect(c.length()).to.equal(0);
                    call_order.push('callback ' + 3);
                });
            } else if (tasks[0] === 3) {
                c.push(4, (err, arg) => {
                    expect(err).to.equal('error');
                    expect(arg).to.equal('arg');
                    expect(c.length()).to.equal(0);
                    call_order.push('callback ' + 4);
                });
                expect(c.length()).to.equal(1);
                c.push(5, (err, arg) => {
                    expect(err).to.equal('error');
                    expect(arg).to.equal('arg');
                    expect(c.length()).to.equal(0);
                    call_order.push('callback ' + 5);
                });
            }

            setTimeout(() => {
                call_order.push('process ' + tasks.join(' '));
                callback('error', 'arg');
            }, delays.shift());
        }, 2, 2);

        c.push(1, (err, arg) => {
            expect(err).to.equal('error');
            expect(arg).to.equal('arg');
            expect(c.length()).to.equal(2);
            call_order.push('callback ' + 1);
        });
        c.push(2, (err, arg) => {
            expect(err).to.equal('error');
            expect(arg).to.equal('arg');
            expect(c.length()).to.equal(2);
            call_order.push('callback ' + 2);
        });

        expect(c.length()).to.equal(2);

        c.drain(() => {
            expect(call_order).to.eql([
                'process 1 2', 'callback 1', 'callback 2',
                'process 3', 'callback 3',
                'process 4 5', 'callback 4', 'callback 5'
            ]);
            expect(c.length()).to.equal(0);
            done();
        });
    });

    it('without callback', (done) => {
        var call_order = [];
        var c = async.cargoQueue(worker.bind({ call_order }), 2, 2);
        c.push(1);
        async.setImmediate(() => {
            c.push(2);
            async.setImmediate(() => {
                c.push(3);
                c.push(4);
                async.setImmediate(() => {
                    c.push(5);
                    c.drain(() => {
                        expect(call_order).to.eql([
                            'process 1',
                            'process 2',
                            'process 3 4',
                            'process 5'
                        ]);
                        done();
                    })
                })
            })
        })
    });

    it('bulk task', (done) => {
        var call_order = [],
            delays = [20,30];

        // worker: -123-4-
        // order of completion: 1,2,3,4

        var c = async.cargoQueue((tasks, callback) => {
            setTimeout(() => {
                call_order.push('process ' + tasks.join(' '));
                callback('error', tasks.join(' '));
            }, delays.shift());
        }, 3, 2);

        c.push( [1,2,3,4], (err, arg) => {
            expect(err).to.equal('error');
            call_order.push('callback ' + arg);
        });

        expect(c.length()).to.equal(4);

        setTimeout(() => {
            expect(call_order).to.eql([
                'process 1 2', 'callback 1 2', 'callback 1 2',
                'process 3 4', 'callback 3 4', 'callback 3 4',
            ]);
            expect(c.length()).to.equal(0);
            done();
        }, 200);
    });

    it('drain once', (done) => {

        var c = async.cargoQueue((tasks, callback) => {
            callback();
        }, 3, 2);

        var drainCounter = 0;
        c.drain(() => {
            drainCounter++;
        });

        for(var i = 0; i < 10; i++){
            c.push(i);
        }

        setTimeout(() => {
            expect(drainCounter).to.equal(1);
            done();
        }, 50);
    });

    it('drain twice', (done) => {

        var c = async.cargoQueue((tasks, callback) => {
            callback();
        }, 3, 2);

        function loadCargo(){
            for(var i = 0; i < 10; i++){
                c.push(i);
            }
        }

        var drainCounter = 0;
        c.drain(() => {
            drainCounter++;

            if (drainCounter === 1) {
                loadCargo();
            } else {
                expect(drainCounter).to.equal(2);
                done();
            }
        });

        loadCargo();
    });

    it('events', (done) => {
        var calls = [];
        var q = async.cargoQueue((task, cb) => {
            // nop
            calls.push('process ' + task);
            async.setImmediate(cb);
        }, 3, 1);

        q.saturated(() => {
            assert(q.running() == 3, 'cargoQueue should be saturated now');
            calls.push('saturated');
        });
        q.empty(() => {
            assert(q.length() === 0, 'cargoQueue should be empty now');
            calls.push('empty');
        });
        q.drain(() => {
            assert(
                q.length() === 0 && q.running() === 0,
                'cargoQueue should be empty now and no more workers should be running'
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
        });
        q.push('foo', () => {calls.push('foo cb');});
        q.push('bar', () => {calls.push('bar cb');});
        q.push('zoo', () => {calls.push('zoo cb');});
        q.push('poo', () => {calls.push('poo cb');});
        q.push('moo', () => {calls.push('moo cb');});
    });

    it('expose payload', (done) => {
        var called_once = false;
        var cargo = async.cargoQueue((tasks, cb) => {
            if (!called_once) {
                expect(cargo.payload).to.equal(1);
                assert(tasks.length === 1, 'should start with payload = 1');
            } else {
                expect(cargo.payload).to.equal(2);
                assert(tasks.length === 2, 'next call shold have payload = 2');
            }
            called_once = true;
            setTimeout(cb, 25);
        }, 1, 1);

        cargo.drain(done);

        expect(cargo.payload).to.equal(1);

        cargo.push([1, 2, 3]);

        setTimeout(() => {
            cargo.payload = 2;
        }, 15);
    });


    it('expose concurrency', (done) => {
        var called_once = false;
        var cargo = async.cargoQueue((tasks, cb) => {
            if (!called_once) {
                expect(cargo.concurrency).to.equal(1);
            } else {
                expect(cargo.concurrency).to.equal(2);
            }
            called_once = true;
            setTimeout(cb, 25);
        }, 1, 1);

        cargo.drain(done);

        expect(cargo.concurrency).to.equal(1);

        cargo.push([1, 2, 3]);

        setTimeout(() => {
            cargo.concurrency = 2;
        }, 15);
    });

    it('workersList', (done) => {
        var called_once = false;

        function getWorkersListData(cargo) {
            return cargo.workersList().map((v) => {
                return v.data;
            });
        }

        var cargo = async.cargoQueue((tasks, cb) => {
            if (!called_once) {
                expect(tasks).to.eql(['foo', 'bar']);
            } else {
                expect(tasks).to.eql(['baz']);
            }
            expect(getWorkersListData(cargo)).to.eql(tasks);
            async.setImmediate(() => {
                // ensure nothing has changed
                expect(getWorkersListData(cargo)).to.eql(tasks);
                called_once = true;
                cb();
            });
        }, 1, 2);

        cargo.drain(() => {
            expect(cargo.workersList()).to.eql([]);
            expect(cargo.running()).to.equal(0);
            done();
        });

        cargo.push('foo');
        cargo.push('bar');
        cargo.push('baz');
    });

    it('running', (done) => {
        var cargo = async.cargoQueue((tasks, cb) => {
            expect(cargo.running()).to.equal(1);
            async.setImmediate(() => {
                expect(cargo.running()).to.equal(1);
                cb();
            });
        }, 1, 1);

        cargo.drain(() => {
            expect(cargo.running()).to.equal(0);
            done();
        });

        cargo.push(['foo', 'bar', 'baz', 'boo']);
    })
});
