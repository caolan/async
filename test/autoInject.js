/* eslint prefer-arrow-callback: 0, object-shorthand: 0 */
var async = require('../lib');
var {expect} = require('chai');

describe('autoInject', () => {

    it("basics", (done) => {
        var callOrder = [];
        async.autoInject({
            task1(task2, callback){
                expect(task2).to.equal(2);
                setTimeout(() => {
                    callOrder.push('task1');
                    callback(null, 1);
                }, 25);
            },
            task2(callback){
                setTimeout(() => {
                    callOrder.push('task2');
                    callback(null, 2);
                }, 50);
            },
            task3: function (task2, callback){
                expect(task2).to.equal(2);
                callOrder.push('task3');
                callback(null, 3);
            },
            task4: function task4(task1, task2, callback){
                expect(task1).to.equal(1);
                expect(task2).to.equal(2);
                callOrder.push('task4');
                callback(null, 4);
            },
            task5(task2, callback){
                expect(task2).to.equal(2);
                setTimeout(() => {
                    callOrder.push('task5');
                    callback(null, 5);
                }, 0);
            },
            task6(task2, callback){
                expect(task2).to.equal(2);
                callOrder.push('task6');
                callback(null, 6);
            }
        },
        (err, results) => {
            expect(results).to.eql({task1: 1, task2: 2, task3: 3, task4: 4, task5: 5, task6: 6})
            expect(results.task6).to.equal(6);
            expect(callOrder).to.eql(['task2','task3','task6','task5','task1','task4']);
            done();
        });
    });

    it('should work with array tasks', (done) => {
        var callOrder = [];

        async.autoInject({
            task1 (cb) {
                callOrder.push('task1');
                cb(null, 1);
            },
            task2: ['task3', function ( task3 , cb ) {
                expect(task3).to.equal(3);
                callOrder.push('task2');
                cb(null, 2);
            }],
            task3 (cb) {
                callOrder.push('task3');
                cb(null, 3);
            }
        }, (err, results) => {
            expect(results).to.eql({task1: 1, task2: 2, task3: 3})
            expect(callOrder).to.eql(['task1','task3','task2']);
            done();
        });
    });

    it('should handle array tasks with just a function', (done) => {
        async.autoInject({
            a: [function (cb) {
                cb(null, 1);
            }],
            b: ["a", function (a, cb) {
                expect(a).to.equal(1);
                cb();
            }]
        }, done);
    });

    it('should throw error for function without explicit parameters', () => {
        expect(() => async.autoInject({
            a () {}
        })).to.throw()
    });

    it('should work with es6 arrow syntax', (done) => {
        async.autoInject({
            task1: (cb)           => cb(null, 1),
            task2: ( task3 , cb ) => cb(null, 2),
            task3: cb             => cb(null, 3)
        }, (err, results) => {
            expect(results.task1).to.equal(1);
            expect(results.task3).to.equal(3);
            done();
        });
    });


    it('should work with es6 default param syntax', (done) => {
        async.autoInject({
            task1 (cb){             cb(null, 1) },
            task2 ( task3 , cb ) {  cb(null, 2) },
            task3 (cb) {            cb(null, 3) },
            task4 ( task2 , cb ) {  cb(null) },
            task5 ( task4 = 4 , cb ) { cb(null, task4 + 1) }
        }, (err, results) => {
            expect(results.task1).to.equal(1);
            expect(results.task3).to.equal(3);
            expect(results.task4).to.equal(undefined);
            expect(results.task5).to.equal(5);
            done();
        });
    });

    it('should be cancelable', (done) => {
        var call_order = [];

        async.autoInject({
            task1 (cb) {
                call_order.push('task1');
                cb(null, 1);
            },
            task2 (task3, cb) {
                call_order.push('task2');
                cb(null, 2);
            },
            task3 (cb) {
                call_order.push('task3');
                cb(false);
            },
        }, () => {
            throw new Error('should not get here');
        });

        setTimeout(() => {
            expect(call_order).to.eql(['task1', 'task3']);
            done();
        }, 25);
    });

    it('should work with complicated functions', done => {
        async.autoInject({
            one: (cb) => cb(null, 1),
            two: (cb) => cb(null, 2),
            three: (cb) => cb(null, 3),
            result: (one, two, three, cb) => {
                if (!one || !two || !three) {
                    return cb('fail')
                }
                function add (a, b, c) {
                    return  a + b + c
                }
                add(one, two, three)
                cb(null, 1 + 2 + 3)
            }
        }, (err, results) => {
            expect(results).to.eql({ one: 1, two: 2, three: 3, result: 6 })
            done()
        })
    })

    it('should work with functions with args on multiple lines', done => {
        async.autoInject({
            one: (cb) => cb(null, 1),
            two: (cb) => cb(null, 2),
            three: (cb) => cb(null, 3),
            result: function (
                one,
                two,
                three,
                cb
            ) {
                cb(null, 1 + 2 + 3)
            }
        }, (err, results) => {
            expect(results).to.eql({ one: 1, two: 2, three: 3, result: 6 })
            done()
        })
    })

    it('should work with methods with args on multiple lines', done => {
        async.autoInject({
            one: (cb) => cb(null, 1),
            two: (cb) => cb(null, 2),
            three: (cb) => cb(null, 3),
            result (
                one,
                two,
                three,
                cb
            ) {
                cb(null, 1 + 2 + 3)
            }
        }, (err, results) => {
            expect(results).to.eql({ one: 1, two: 2, three: 3, result: 6 })
            done()
        })
    })

    it('should work with arrow functions with args on multiple lines', done => {
        async.autoInject({
            one: (cb) => cb(null, 1),
            two: (cb) => cb(null, 2),
            three: (cb) => cb(null, 3),
            result: (
                one,
                two,
                three,
                cb
            ) => cb(null, 1 + 2 + 3)
        }, (err, results) => {
            expect(results).to.eql({ one: 1, two: 2, three: 3, result: 6 })
            done()
        })
    })

    it('should not be subject to ReDoS', () => {
        // This test will timeout if the bug is present.
        var someComments = 'text/*'.repeat(1000000)
        expect(() => async.autoInject({
            someComments,
            a () {}
        })).to.throw()
    });

    it('should properly strip comments in argument definitions', (done) => {
        async.autoInject({
            task1: function(task2, /* ) */ callback) {
                callback(null, true);
            },
            task2: function task2(task3 // )
                ,callback) {
                callback(null, true);
            },
            task3: function task3(task4 /* /* )
                */, callback) {
                callback(null, true);
            },
            task4: function task4(callback) {
                callback(null, true);
            },
        },
        (err, result) => {
            expect(err).to.eql(null);
            expect(result).to.deep.eql({task1: true, task2: true, task3: true, task4: true});
            done();
        });
    });
});
