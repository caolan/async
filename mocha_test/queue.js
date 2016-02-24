var async = require('../lib');
var expect = require('chai').expect;


describe('queue', function(){
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
            }, 10);
            q.unsaturated = function() {
                calls.push('unsaturated');
            };
            q.empty = function() {
                expect(calls.indexOf('unsaturated')).to.be.above(-1);
                setTimeout(function() {
                    expect(calls).eql([
                        'unsaturated',
                        'unsaturated',
                        'unsaturated',
                        'unsaturated',
                        'unsaturated',
                        'process foo0',
                        'process foo1',
                        'process foo2',
                        'process foo3',
                        'process foo4',
                        'foo0 cb',
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
});

