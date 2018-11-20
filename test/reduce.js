var async = require('../lib');
var {expect} = require('chai');
var assert = require('assert');

describe('reduce', () => {

    it('reduce', (done) => {
        var call_order = [];
        async.reduce([1,2,3], 0, (a, x, callback) => {
            call_order.push(x);
            callback(null, a + x);
        }, (err, result) => {
            assert(err === null, err + " passed instead of 'null'");
            expect(result).to.equal(6);
            expect(call_order).to.eql([1,2,3]);
            done();
        });
    });

    it('reduce async with non-reference memo', (done) => {
        async.reduce([1,3,2], 0, (a, x, callback) => {
            setTimeout(() => {callback(null, a + x);}, Math.random()*100);
        }, (err, result) => {
            expect(result).to.equal(6);
            done();
        });
    });

    it('reduce error', (done) => {
        async.reduce([1,2,3], 0, (a, x, callback) => {
            callback('error');
        }, (err) => {
            expect(err).to.equal('error');
        });
        setTimeout(done, 50);
    });

    it('reduce canceled', (done) => {
        var call_order = [];
        async.reduce([1,2,3], 0, (a, x, callback) => {
            call_order.push(x);
            callback(x === 2 ? false : null, a + x)
        }, () => {
            throw new Error('should not get here');
        });

        setTimeout(() => {
            expect(call_order).to.eql([1, 2]);
            done();
        }, 25);
    });

    it('inject alias', (done) => {
        expect(async.inject).to.equal(async.reduce);
        done();
    });

    it('foldl alias', (done) => {
        expect(async.foldl).to.equal(async.reduce);
        done();
    });

    it('reduceRight', (done) => {
        var call_order = [];
        var arr = [1,2,3];
        async.reduceRight(arr, 0, (a, x, callback) => {
            call_order.push(x);
            callback(null, a + x);
        }, (err, result) => {
            expect(result).to.equal(6);
            expect(call_order).to.eql([3,2,1]);
            expect(arr).to.eql([1,2,3]);
            done();
        });
    });

    it('reduceRight canceled', (done) => {
        var call_order = [];
        async.reduceRight([1,2,3], 0, (a, x, callback) => {
            call_order.push(x);
            callback(x === 2 ? false : null, a + x)
        }, () => {
            throw new Error('should not get here');
        });

        setTimeout(() => {
            expect(call_order).to.eql([3, 2]);
            done();
        }, 25);
    });

    it('foldr alias', (done) => {
        expect(async.foldr).to.equal(async.reduceRight);
        done();
    });
});
