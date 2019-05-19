var async = require('../lib');
var {expect} = require('chai');
var assert = require('assert');

describe('cargo', () => {

    it('cargo', (done) => {
        var call_order = [],
            delays = [40, 40, 20];

        // worker: --12--34--5-
        // order of completion: 1,2,3,4,5

        var c = async.cargo((tasks, callback) => {
            setTimeout(() => {
                call_order.push('process ' + tasks.join(' '));
                callback('error', 'arg');
            }, delays.shift());
        }, 2);

        c.push(1, (err, arg) => {
            expect(err).to.equal('error');
            expect(arg).to.equal('arg');
            expect(c.length()).to.equal(3);
            call_order.push('callback ' + 1);
        });
        c.push(2, (err, arg) => {
            expect(err).to.equal('error');
            expect(arg).to.equal('arg');
            expect(c.length()).to.equal(3);
            call_order.push('callback ' + 2);
        });

        expect(c.length()).to.equal(2);

        // async push
        setTimeout(() => {
            c.push(3, (err, arg) => {
                expect(err).to.equal('error');
                expect(arg).to.equal('arg');
                expect(c.length()).to.equal(1);
                call_order.push('callback ' + 3);
            });
        }, 15);
        setTimeout(() => {
            c.push(4, (err, arg) => {
                expect(err).to.equal('error');
                expect(arg).to.equal('arg');
                expect(c.length()).to.equal(1);
                call_order.push('callback ' + 4);
            });
            expect(c.length()).to.equal(2);
            c.push(5, (err, arg) => {
                expect(err).to.equal('error');
                expect(arg).to.equal('arg');
                expect(c.length()).to.equal(0);
                call_order.push('callback ' + 5);
            });
        }, 30);


        c.drain(() => {
            expect(call_order).to.eql([
                'process 1 2', 'callback 1', 'callback 2',
                'process 3 4', 'callback 3', 'callback 4',
                'process 5'  , 'callback 5'
            ]);
            expect(c.length()).to.equal(0);
            done();
        });
    });

    it('without callback', (done) => {
        var call_order = [],
            delays = [40,60,60,20];

        // worker: --1-2---34-5-
        // order of completion: 1,2,3,4,5

        var c = async.cargo((tasks, callback) => {
            setTimeout(() => {
                call_order.push('process ' + tasks.join(' '));
                callback('error', 'arg');
            }, delays.shift());
        }, 2);

        c.push(1);

        setTimeout(() => {
            c.push(2);
        }, 20);
        setTimeout(() => {
            c.push(3);
            c.push(4);
            c.push(5);
        }, 80);

        c.drain(() => {
            expect(call_order).to.eql([
                'process 1',
                'process 2',
                'process 3 4',
                'process 5'
            ]);
            done();
        })
    });

    it('bulk task', (done) => {
        var call_order = [],
            delays = [30,20];

        // worker: -123-4-
        // order of completion: 1,2,3,4

        var c = async.cargo((tasks, callback) => {
            setTimeout(() => {
                call_order.push('process ' + tasks.join(' '));
                callback('error', tasks.join(' '));
            }, delays.shift());
        }, 3);

        c.push( [1,2,3,4], (err, arg) => {
            expect(err).to.equal('error');
            call_order.push('callback ' + arg);
        });

        expect(c.length()).to.equal(4);

        setTimeout(() => {
            expect(call_order).to.eql([
                'process 1 2 3', 'callback 1 2 3',
                'callback 1 2 3', 'callback 1 2 3',
                'process 4', 'callback 4',
            ]);
            expect(c.length()).to.equal(0);
            done();
        }, 200);
    });

    it('drain once', (done) => {

        var c = async.cargo((tasks, callback) => {
            callback();
        }, 3);

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

        var c = async.cargo((tasks, callback) => {
            callback();
        }, 3);

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
        var q = async.cargo((task, cb) => {
            // nop
            calls.push('process ' + task);
            async.setImmediate(cb);
        }, 1);
        q.concurrency = 3;

        q.saturated(() => {
            assert(q.running() == 3, 'cargo should be saturated now');
            calls.push('saturated');
        });
        q.empty(() => {
            assert(q.length() === 0, 'cargo should be empty now');
            calls.push('empty');
        });
        q.drain(() => {
            assert(
                q.length() === 0 && q.running() === 0,
                'cargo should be empty now and no more workers should be running'
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
        var cargo = async.cargo((tasks, cb) => {
            if (!called_once) {
                expect(cargo.payload).to.equal(1);
                assert(tasks.length === 1, 'should start with payload = 1');
            } else {
                expect(cargo.payload).to.equal(2);
                assert(tasks.length === 2, 'next call shold have payload = 2');
            }
            called_once = true;
            setTimeout(cb, 25);
        }, 1);

        cargo.drain(done);

        expect(cargo.payload).to.equal(1);

        cargo.push([1, 2, 3]);

        setTimeout(() => {
            cargo.payload = 2;
        }, 15);
    });

    it('workersList', (done) => {
        var called_once = false;

        function getWorkersListData(cargo) {
            return cargo.workersList().map((v) => {
                return v.data;
            });
        }

        var cargo = async.cargo((tasks, cb) => {
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
        }, 2);

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
        var cargo = async.cargo((tasks, cb) => {
            expect(cargo.running()).to.equal(1);
            async.setImmediate(() => {
                expect(cargo.running()).to.equal(1);
                cb();
            });
        }, 2);

        cargo.drain(() => {
            expect(cargo.running()).to.equal(0);
            done();
        });

        cargo.push('foo');
        cargo.push('bar');
        cargo.push('baz');
    })
});
