var async = require('../../lib');
const expect = require('chai').expect;
const assert = require('assert');


module.exports = function () {
    async function asyncIdentity(val) {
        var res = await Promise.resolve(val);
        return res;
    }

    const input = [1, 2, 3];
    const inputObj = {a: 1, b: 2, c: 3};

    it('should asyncify async functions', (done) => {
        async.asyncify(asyncIdentity)(42, (err, val) => {
            assert(val === 42);
            done(err);
        })
    });

    it('should handle errors in async functions', (done) => {
        async.asyncify(async function () {
            throw new Error('thrown error')
        })((err) => {
            assert(err.message = 'thrown error');
            done();
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


    it('should handle async functions in mapValues', (done) => {
        async.mapValues(inputObj, asyncIdentity, (err, result) => {
            expect(result).to.eql(inputObj);
            done(err);
        });
    });

    it('should handle async functions in mapValuesLimit', (done) => {
        async.mapValuesLimit(inputObj, 2, asyncIdentity, (err, result) => {
            expect(result).to.eql(inputObj);
            done(err);
        });
    });

    it('should handle async functions in mapValuesSeries', (done) => {
        async.mapValuesSeries(inputObj, asyncIdentity, (err, result) => {
            expect(result).to.eql(inputObj);
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

    it('should handle async functions in reject', (done) => {
        async.reject(input, asyncIdentity, (err, result) => {
            expect(result).to.eql([]);
            done(err);
        });
    });

    it('should handle async functions in rejectLimit', (done) => {
        async.rejectLimit(input, 2, asyncIdentity, (err, result) => {
            expect(result).to.eql([]);
            done(err);
        });
    });

    it('should handle async functions in rejectSeries', (done) => {
        async.rejectSeries(input, asyncIdentity, (err, result) => {
            expect(result).to.eql([]);
            done(err);
        });
    });

    it('should handle async functions in every', (done) => {
        async.every(input, asyncIdentity, (err, result) => {
            expect(result).to.eql(true);
            done(err);
        });
    });

    it('should handle async functions in everyLimit', (done) => {
        async.everyLimit(input, 2, asyncIdentity, (err, result) => {
            expect(result).to.eql(true);
            done(err);
        });
    });

    it('should handle async functions in everySeries', (done) => {
        async.everySeries(input, asyncIdentity, (err, result) => {
            expect(result).to.eql(true);
            done(err);
        });
    });

    it('should handle async functions in some', (done) => {
        async.some(input, asyncIdentity, (err, result) => {
            expect(result).to.eql(true);
            done(err);
        });
    });

    it('should handle async functions in someLimit', (done) => {
        async.someLimit(input, 2, asyncIdentity, (err, result) => {
            expect(result).to.eql(true);
            done(err);
        });
    });

    it('should handle async functions in someSeries', (done) => {
        async.someSeries(input, asyncIdentity, (err, result) => {
            expect(result).to.eql(true);
            done(err);
        });
    });

    it('should handle async functions in groupBy', (done) => {
        async.groupBy(input, asyncIdentity, (err, result) => {
            expect(result).to.eql({1: [1], 2: [2], 3: [3]});
            done(err);
        });
    });

    it('should handle async functions in groupByLimit', (done) => {
        async.groupByLimit(input, 2, asyncIdentity, (err, result) => {
            expect(result).to.eql({1: [1], 2: [2], 3: [3]});
            done(err);
        });
    });

    it('should handle async functions in groupBySeries', (done) => {
        async.groupBySeries(input, asyncIdentity, (err, result) => {
            expect(result).to.eql({1: [1], 2: [2], 3: [3]});
            done(err);
        });
    });


    it('should handle async functions in concat', (done) => {
        async.concat(input, asyncIdentity, (err, result) => {
            expect(result).to.eql(input);
            done(err);
        });
    });

    it('should handle async functions in concatSeries', (done) => {
        async.concatSeries(input, asyncIdentity, (err, result) => {
            expect(result).to.eql(input);
            done(err);
        });
    });

    it('should handle async functions in reduce', (done) => {
        async.reduce(input, 0, async function (acc, val) {
            var res = await Promise.resolve(acc + val);
            return res;
        },
        (err, result) => {
            expect(result).to.eql(6);
            done(err);
        });
    });

    it('should handle async functions in reduceRight', (done) => {
        async.reduceRight(input, 0, async function (acc, val) {
            var res = await Promise.resolve(acc + val);
            return res;
        },
        (err, result) => {
            expect(result).to.eql(6);
            done(err);
        });
    });

    it('should handle async functions in sortBy', (done) => {
        async.sortBy([3, 2, 1], asyncIdentity, (err, result) => {
            expect(result).to.eql(input);
            done(err);
        });
    });

    it('should handle async functions in transform', (done) => {
        async.transform(inputObj, async function (obj, val, key) {
            obj[key] = await Promise.resolve(val);
        }, (err, result) => {
            expect(result).to.eql(inputObj);
            done(err);
        });
    });
}
