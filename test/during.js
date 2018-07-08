var async = require('../lib');
var expect = require('chai').expect;
var assert = require('assert');

describe('during', () => {

    it('during', (done) => {
        var call_order = [];

        var count = 0;
        async.during(
            (cb) => {
                call_order.push(['test', count]);
                cb(null, count < 5);
            },
            (cb) => {
                call_order.push(['iteratee', count]);
                count++;
                cb(null, count);
            },
            (err) => {
                assert(err === null, err + " passed instead of 'null'");
                expect(call_order).to.eql([
                    ['test', 0],
                    ['iteratee', 0], ['test', 1],
                    ['iteratee', 1], ['test', 2],
                    ['iteratee', 2], ['test', 3],
                    ['iteratee', 3], ['test', 4],
                    ['iteratee', 4], ['test', 5],
                ]);
                expect(count).to.equal(5);
                done();
            }
        );
    });

    it('during canceling', (done) => {
        let counter = 0;
        async.during(
            cb => cb(null, true),
            cb => {
                counter++
                cb(counter === 2 ? false : null);
            },
            () => { throw new Error('should not get here')}
        );
        setTimeout(() => {
            expect(counter).to.equal(2);
            done();
        }, 10)
    })

    it('doDuring', (done) => {
        var call_order = [];

        var count = 0;
        async.doDuring(
            (cb) => {
                call_order.push(['iteratee', count]);
                count++;
                cb(null, count);
            },
            (c, cb) => {
                expect(c).to.equal(count);
                call_order.push(['test', count]);
                cb(null, count < 5);
            },
            (err) => {
                assert(err === null, err + " passed instead of 'null'");
                expect(call_order).to.eql([
                    ['iteratee', 0], ['test', 1],
                    ['iteratee', 1], ['test', 2],
                    ['iteratee', 2], ['test', 3],
                    ['iteratee', 3], ['test', 4],
                    ['iteratee', 4], ['test', 5],
                ]);
                expect(count).to.equal(5);
                done();
            }
        );
    });

    it('doDuring - error test', (done) => {
        var error = new Error('asdas');

        async.doDuring(
            (cb) => {
                cb(error);
            },
            () => {},
            (err) => {
                expect(err).to.equal(error);
                done();
            }
        );
    });

    it('doDuring - error iteratee', (done) => {
        var error = new Error('asdas');

        async.doDuring(
            (cb) => {
                cb(null);
            },
            (cb) => {
                cb(error);
            },
            (err) => {
                expect(err).to.equal(error);
                done();
            }
        );
    });

    it('doDuring canceling', (done) => {
        let counter = 0;
        async.doDuring(
            cb => {
                counter++
                cb(counter === 2 ? false : null);
            },
            cb => cb(null, true),
            () => { throw new Error('should not get here')}
        );
        setTimeout(() => {
            expect(counter).to.equal(2);
            done();
        }, 10)
    })

    it('doDuring canceling in test', (done) => {
        let counter = 0;
        async.doDuring(
            cb => {
                counter++
                cb(null, counter);
            },
            (n, cb) => cb(n === 2 ? false : null, true),
            () => { throw new Error('should not get here')}
        );
        setTimeout(() => {
            expect(counter).to.equal(2);
            done();
        }, 10)
    })
});
