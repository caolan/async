var async = require('../lib');
var expect = require('chai').expect;
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
            }, n * 25);
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
        setTimeout(done, 50);
    });

    it('timesSeries', (done) => {
        var call_order = [];
        async.timesSeries(5, (n, callback) => {
            setTimeout(() => {
                call_order.push(n);
                callback(null, n);
            }, 100 - n * 10);
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
        setTimeout(done, 50);
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
});
