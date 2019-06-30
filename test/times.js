var async = require('../lib');
var {expect} = require('chai');
var assert = require('assert');

describe('times', () => {

    it('times', (done) => {
        async.times(5, (n, next) => {
            next(null, n);
        }, (err, results) => {
            assert(err === null, err + " passed instead of 'null'");
            expect(results).to.eql([0,1,2,3,4]);
            done();
        });
    });

    it('times 3', (done) => {
        var args = [];
        async.times(3, (n, callback) => {
            setTimeout(() => {
                args.push(n);
                callback();
            }, 15);
        }, (err) => {
            if (err) throw err;
            expect(args).to.eql([0,1,2]);
            done();
        });
    });

    it('times 0', (done) => {
        async.times(0, (n, callback) => {
            assert(false, 'iteratee should not be called');
            callback();
        }, (err) => {
            if (err) throw err;
            assert(true, 'should call callback');
        });
        setTimeout(done, 25);
    });

    it('times error', (done) => {
        async.times(3, (n, callback) => {
            callback('error');
        }, (err) => {
            expect(err).to.equal('error');
        });
        setTimeout(done, 10);
    });

    it('times canceled', (done) => {
        var call_order = [];
        async.times(5, (n, callback) => {
            call_order.push(n);
            if (n === 2) {
                return callback(false, n);
            }
            callback(null, n);
        }, () => {
            throw new Error('should not get here');
        });

        setTimeout(() => {
            expect(call_order).to.eql([0,1,2]);
            done();
        }, 25);
    });

    it('timesSeries', (done) => {
        var call_order = [];
        async.timesSeries(5, (n, callback) => {
            setTimeout(() => {
                call_order.push(n);
                callback(null, n);
            }, 5);
        }, (err, results) => {
            expect(call_order).to.eql([0,1,2,3,4]);
            expect(results).to.eql([0,1,2,3,4]);
            done();
        });
    });

    it('timesSeries error', (done) => {
        async.timesSeries(5, (n, callback) => {
            callback('error');
        }, (err) => {
            expect(err).to.equal('error');
        });
        setTimeout(done, 10);
    });

    it('timesSeries canceled', (done) => {
        var call_order = [];
        async.timesSeries(5, (n, callback) => {
            call_order.push(n);
            async.setImmediate(() => {
                if (n === 2) {
                    return callback(false, n);
                }
                callback(null, n);
            })
        }, () => {
            throw new Error('should not get here');
        });

        setTimeout(() => {
            expect(call_order).to.eql([0,1,2]);
            done();
        }, 25);
    });

    it('timesLimit', (done) => {
        var limit = 2;
        var running = 0;
        async.timesLimit(5, limit, (i, next) => {
            running++;
            assert(running <= limit && running > 0, running);
            setTimeout(() => {
                running--;
                next(null, i * 2);
            }, (3 - i) * 10);
        }, (err, results) => {
            assert(err === null, err + " passed instead of 'null'");
            expect(results).to.eql([0, 2, 4, 6, 8]);
            done();
        });
    });

    it('timesLimit canceled', (done) => {
        var call_order = [];
        async.timesLimit(5, 2, (n, callback) => {
            call_order.push(n);
            async.setImmediate(() => {
                if (n === 2) {
                    return callback(false, n);
                }
                callback(null, n);
            })
        }, () => {
            throw new Error('should not get here');
        });

        setTimeout(() => {
            expect(call_order).to.eql([0,1,2,3]);
            done();
        }, 25);
    });
});
