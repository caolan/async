var async = require('../lib');
var {expect} = require('chai');
var assert = require('assert');

describe('whilst', () => {
    it('whilst', (done) => {
        var call_order = [];

        var count = 0;
        async.whilst(
            (cb) => {
                expect(cb).to.be.a('function');
                call_order.push(['test', count]);
                return cb(null, count < 5);
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

    it('errors', (done) => {
        async.whilst(
            cb => cb(new Error('bad test')),
            cb => cb(),
            err => {
                expect(err.message).to.equal('bad test')
                done()
            }
        )
    })

    it('errors (iteratee)', (done) => {
        async.whilst(
            cb => cb(null, true),
            cb => cb(new Error('bad iter')),
            err => {
                expect(err.message).to.equal('bad iter')
                done()
            }
        )
    })

    it('whilst optional callback', (done) => {
        var counter = 0;
        async.whilst(
            (cb) => cb(null, counter < 2),
            (cb) => {
                counter++;
                cb();
            }
        );
        expect(counter).to.equal(2);
        done();
    });

    it('whilst canceling', (done) => {
        var counter = 0;
        async.whilst(
            (cb) => cb(null, counter < 3),
            (cb) => {
                counter++;
                cb(counter === 2 ? false : null);
            },
            () => { throw new Error('should not get here')}
        );
        setTimeout(() => {
            expect(counter).to.equal(2);
            done();
        }, 10)
    });

    it('should not error when test is false on first iteration', (done) => {
        var counter = 0;

        async.whilst(
            (cb) => cb(null, false),
            (cb) => {
                counter++;
                cb(null);
            },
            (err, result) => {
                expect(err).to.eql(null);
                expect(result).to.be.undefined;
                expect(counter).to.equal(0);
                done();
            }
        );
    });

    it('doWhilst', (done) => {
        var call_order = [];

        var count = 0;
        async.doWhilst(
            (cb) => {
                call_order.push(['iteratee', count]);
                count++;
                cb(null, count);
            },
            (c, cb) => {
                expect(c).to.equal(count);
                call_order.push(['test', count]);
                return cb(null, count < 5);
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

    it('doWhilst callback params', (done) => {
        var call_order = [];
        var count = 0;
        async.doWhilst(
            (cb) => {
                call_order.push(['iteratee', count]);
                count++;
                cb(null, count);
            },
            (c, cb) => {
                call_order.push(['test', c]);
                return cb(null, c < 5);
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

    it('doWhilst - error', (done) => {
        var error = new Error('asdas');

        async.doWhilst(
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

    it('doWhilst canceling', (done) => {
        let counter = 0;
        async.doWhilst(
            cb => {
                counter++
                cb(counter === 2 ? false : null);
            },
            (cb) => cb(null, true),
            () => { throw new Error('should not get here')}
        );
        setTimeout(() => {
            expect(counter).to.equal(2);
            done();
        }, 10)
    })
});
