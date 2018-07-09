var async = require('../lib');
var {expect} = require('chai');
var assert = require('assert');

describe('until', () => {
    it('until', (done) => {
        var call_order = [];
        var count = 0;
        async.until(
            (cb) => {
                expect(cb).to.be.a('function');
                call_order.push(['test', count]);
                return cb(null, count == 5);
            },
            (cb) => {
                call_order.push(['iteratee', count]);
                count++;
                cb(null, count);
            },
            (err, result) => {
                assert(err === null, err + " passed instead of 'null'");
                expect(result).to.equal(5, 'last result passed through');
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

    it('until canceling', (done) => {
        let counter = 0;
        async.until(
            (cb) => cb(null, false),
            cb => {
                counter++
                cb(counter === 2 ? false: null);
            },
            () => { throw new Error('should not get here')}
        );
        setTimeout(() => {
            expect(counter).to.equal(2);
            done();
        }, 10)
    })

    it('doUntil', (done) => {
        var call_order = [];
        var count = 0;
        async.doUntil(
            (cb) => {
                call_order.push(['iteratee', count]);
                count++;
                cb(null, count);
            },
            (c, cb) => {
                expect(c).to.equal(count);
                call_order.push(['test', count]);
                return cb(null, count == 5);
            },
            (err, result) => {
                assert(err === null, err + " passed instead of 'null'");
                expect(result).to.equal(5, 'last result passed through');
                expect(call_order).to.eql([
                    ['iteratee', 0], ['test', 1],
                    ['iteratee', 1], ['test', 2],
                    ['iteratee', 2], ['test', 3],
                    ['iteratee', 3], ['test', 4],
                    ['iteratee', 4], ['test', 5]
                ]);
                expect(count).to.equal(5);
                done();
            }
        );
    });

    it('doUntil callback params', (done) => {
        var call_order = [];
        var count = 0;
        async.doUntil(
            (cb) => {
                call_order.push(['iteratee', count]);
                count++;
                cb(null, count);
            },
            (c, cb) => {
                call_order.push(['test', c]);
                return cb(null, c == 5);
            },
            (err, result) => {
                if (err) throw err;
                expect(result).to.equal(5, 'last result passed through');
                expect(call_order).to.eql([
                    ['iteratee', 0], ['test', 1],
                    ['iteratee', 1], ['test', 2],
                    ['iteratee', 2], ['test', 3],
                    ['iteratee', 3], ['test', 4],
                    ['iteratee', 4], ['test', 5]
                ]);
                expect(count).to.equal(5);
                done();
            }
        );
    });

    it('doUntil canceling', (done) => {
        let counter = 0;
        async.doUntil(
            cb => {
                counter++
                cb(counter === 2 ? false: null);
            },
            (cb) => cb(null, false),
            () => { throw new Error('should not get here')}
        );
        setTimeout(() => {
            expect(counter).to.equal(2);
            done();
        }, 10)
    })
});
