var async = require('../lib');
var expect = require('chai').expect;
var assert = require('assert');

describe('cargo', function () {

    it('cargo', function (done) {
        var call_order = [],
            delays = [40, 40, 20];

        // worker: --12--34--5-
        // order of completion: 1,2,3,4,5

        var c = async.cargo(function (tasks, callback) {
            setTimeout(function () {
                call_order.push('process ' + tasks.join(' '));
                callback('error', 'arg');
            }, delays.shift());
        }, 2);

        c.push(1, function (err, arg) {
            expect(err).to.equal('error');
            expect(arg).to.equal('arg');
            expect(c.length()).to.equal(3);
            call_order.push('callback ' + 1);
        });
        c.push(2, function (err, arg) {
            expect(err).to.equal('error');
            expect(arg).to.equal('arg');
            expect(c.length()).to.equal(3);
            call_order.push('callback ' + 2);
        });

        expect(c.length()).to.equal(2);

        // async push
        setTimeout(function () {
            c.push(3, function (err, arg) {
                expect(err).to.equal('error');
                expect(arg).to.equal('arg');
                expect(c.length()).to.equal(1);
                call_order.push('callback ' + 3);
            });
        }, 15);
        setTimeout(function () {
            c.push(4, function (err, arg) {
                expect(err).to.equal('error');
                expect(arg).to.equal('arg');
                expect(c.length()).to.equal(1);
                call_order.push('callback ' + 4);
            });
            expect(c.length()).to.equal(2);
            c.push(5, function (err, arg) {
                expect(err).to.equal('error');
                expect(arg).to.equal('arg');
                expect(c.length()).to.equal(0);
                call_order.push('callback ' + 5);
            });
        }, 30);


        c.drain = function () {
            expect(call_order).to.eql([
                'process 1 2', 'callback 1', 'callback 2',
                'process 3 4', 'callback 3', 'callback 4',
                'process 5'  , 'callback 5'
            ]);
            expect(c.length()).to.equal(0);
            done();
        };
    });

    it('without callback', function (done) {
        var call_order = [],
            delays = [40,20,60,20];

        // worker: --1-2---34-5-
        // order of completion: 1,2,3,4,5

        var c = async.cargo(function (tasks, callback) {
            setTimeout(function () {
                call_order.push('process ' + tasks.join(' '));
                callback('error', 'arg');
            }, delays.shift());
        }, 2);

        c.push(1);

        setTimeout(function () {
            c.push(2);
        }, 30);
        setTimeout(function () {
            c.push(3);
            c.push(4);
            c.push(5);
        }, 50);

        setTimeout(function () {
            expect(call_order).to.eql([
                'process 1',
                'process 2',
                'process 3 4',
                'process 5'
            ]);
            done();
        }, 200);
    });

    it('bulk task', function (done) {
        var call_order = [],
            delays = [30,20];

        // worker: -123-4-
        // order of completion: 1,2,3,4

        var c = async.cargo(function (tasks, callback) {
            setTimeout(function () {
                call_order.push('process ' + tasks.join(' '));
                callback('error', tasks.join(' '));
            }, delays.shift());
        }, 3);

        c.push( [1,2,3,4], function (err, arg) {
            expect(err).to.equal('error');
            call_order.push('callback ' + arg);
        });

        expect(c.length()).to.equal(4);

        setTimeout(function () {
            expect(call_order).to.eql([
                'process 1 2 3', 'callback 1 2 3',
                'callback 1 2 3', 'callback 1 2 3',
                'process 4', 'callback 4',
            ]);
            expect(c.length()).to.equal(0);
            done();
        }, 200);
    });

    it('drain once', function (done) {

        var c = async.cargo(function (tasks, callback) {
            callback();
        }, 3);

        var drainCounter = 0;
        c.drain = function () {
            drainCounter++;
        };

        for(var i = 0; i < 10; i++){
            c.push(i);
        }

        setTimeout(function(){
            expect(drainCounter).to.equal(1);
            done();
        }, 50);
    });

    it('drain twice', function (done) {

        var c = async.cargo(function (tasks, callback) {
            callback();
        }, 3);

        function loadCargo(){
            for(var i = 0; i < 10; i++){
                c.push(i);
            }
        }

        var drainCounter = 0;
        c.drain = function () {
            drainCounter++;
        };

        loadCargo();
        setTimeout(loadCargo, 50);

        setTimeout(function(){
            expect(drainCounter).to.equal(2);
            done();
        }, 100);
    });

    it('events', function (done) {
        var calls = [];
        var q = async.cargo(function(task, cb) {
            // nop
            calls.push('process ' + task);
            async.setImmediate(cb);
        }, 1);
        q.concurrency = 3;

        q.saturated = function() {
            assert(q.running() == 3, 'cargo should be saturated now');
            calls.push('saturated');
        };
        q.empty = function() {
            assert(q.length() === 0, 'cargo should be empty now');
            calls.push('empty');
        };
        q.drain = function() {
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
        };
        q.push('foo', function () {calls.push('foo cb');});
        q.push('bar', function () {calls.push('bar cb');});
        q.push('zoo', function () {calls.push('zoo cb');});
        q.push('poo', function () {calls.push('poo cb');});
        q.push('moo', function () {calls.push('moo cb');});
    });

    it('expose payload', function (done) {
        var called_once = false;
        var cargo= async.cargo(function(tasks, cb) {
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

        cargo.drain = function () {
            done();
        };

        expect(cargo.payload).to.equal(1);

        cargo.push([1, 2, 3]);

        setTimeout(function () {
            cargo.payload = 2;
        }, 15);
    });

});
