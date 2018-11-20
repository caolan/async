var async = require('../lib');
var {expect} = require('chai');

describe('transform', () => {

    it('transform implictly determines memo if not provided', (done) => {
        async.transform([1,2,3], (memo, x, v, callback) => {
            memo.push(x + 1);
            callback();
        }, (err, result) => {
            expect(result).to.eql([2, 3, 4]);
            done();
        });
    });

    it('transform async with object memo', (done) => {
        async.transform([1,3,2], {}, (memo, v, k, callback) => {
            setTimeout(() => {
                memo[k] = v;
                callback();
            });
        }, (err, result) => {
            expect(err).to.equal(null);
            expect(result).to.eql({
                0: 1,
                1: 3,
                2: 2
            });
            done();
        });
    });

    it('transform iterating object', (done) => {
        async.transform({a: 1, b: 3, c: 2}, (memo, v, k, callback) => {
            setTimeout(() => {
                memo[k] = v + 1;
                callback();
            });
        }, (err, result) => {
            expect(err).to.equal(null);
            expect(result).to.eql({a: 2, b: 4, c: 3});
            done();
        });
    });

    it('transform error', (done) => {
        async.transform([1,2,3], (a, v, k, callback) => {
            callback('error');
        }, (err) => {
            expect(err).to.equal('error');
            done();
        });
    });

    it('transform canceled', (done) => {
        var call_order = [];
        async.transform([1,2,3], (a, v, k, callback) => {
            call_order.push(v);
            a.push(v + 1);
            callback(v === 2 ? false : null);
        }, () => {
            throw new Error('should not get here');
        });

        setTimeout(() => {
            expect(call_order).to.eql([1, 2, 3]);
            done();
        }, 25);
    });

    it('transform with two arguments', (done) => {
        try {
            async.transform([1, 2, 3], (a, v, k, callback) => {
                callback();
            });
            done();
        } catch (e) {
            expect.fail();
        }
    });
});
