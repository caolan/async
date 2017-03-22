var async = require('../../lib');
const expect = require('chai').expect;
const assert = require('assert');


module.exports = function () {
    async function asyncIdentity(val) {
        var res = await Promise.resolve(val);
        return res;
    }

    const input = [1, 2, 3];

    it('should asyncify async functions', (done) => {
        async.asyncify(asyncIdentity)(42, (err, val) => {
            assert(val === 42);
            done(err);
        })
    });

    it('should handle async functions in each', (done) => {
        async.each(input, asyncIdentity, done);
    });

    it('should handle async functions in eachLimit', (done) => {
        async.eachLimit(input, 2, asyncIdentity, done);
    });

    it('should handle async functions in eachSeries', (done) => {
        async.eachSeries(input, asyncIdentity, done);
    });

    it('should handle async functions in eachOf', (done) => {
        async.eachOf(input, asyncIdentity, done);
    });

    it('should handle async functions in eachOfLimit', (done) => {
        async.eachOfLimit(input, 2, asyncIdentity, done);
    });

    it('should handle async functions in eachOfSeries', (done) => {
        async.eachOfSeries(input, asyncIdentity, done);
    });

    it('should handle async functions in map', (done) => {
        async.map(input, asyncIdentity, (err, result) => {
            expect(result).to.eql(input);
            done(err);
        });
    });

    it('should handle async functions in mapLimit', (done) => {
        async.mapLimit(input, 2, asyncIdentity, (err, result) => {
            expect(result).to.eql(input);
            done(err);
        });
    });

    it('should handle async functions in mapSeries', (done) => {
        async.mapSeries(input, asyncIdentity, (err, result) => {
            expect(result).to.eql(input);
            done(err);
        });
    });

    it('should handle async functions in filter', (done) => {
        async.filter(input, asyncIdentity, (err, result) => {
            expect(result).to.eql(input);
            done(err);
        });
    });

    it('should handle async functions in filterLimit', (done) => {
        async.filterLimit(input, 2, asyncIdentity, (err, result) => {
            expect(result).to.eql(input);
            done(err);
        });
    });

    it('should handle async functions in filterSeries', (done) => {
        async.filterSeries(input, asyncIdentity, (err, result) => {
            expect(result).to.eql(input);
            done(err);
        });
    });
}
