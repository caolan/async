var async = require('../../lib');
const {expect} = require('chai');
const {default: wrapAsync} = require('../../lib/internal/wrapAsync')


module.exports = function () {
    async function asyncIdentity(val) {
        var res = await Promise.resolve(val);
        return res;
    }

    const input = [1, 2, 3];
    const inputObj = {a: 1, b: 2, c: 3};

    it('asyncify should not add an additional level of wrapping', () => {
        const wrapped = wrapAsync(async.each)
        let sameStack = false
        wrapped([1], (val, cb) => cb(), () => {sameStack = true})
        expect(sameStack).to.equal(true)
    })

    it('should throw as expected (async)', async () => {
        try {
            await async.each(input, async val => { throw new Error(val) });
        } catch (e) {
            var thrown = e
        }
        expect(thrown).to.be.an('error')
    });

    it('should throw as expected (callback)', async () => {
        let thrown
        await async.each(input, (val) => {
            throw new Error(val)
        }).catch(e => {thrown = e})
        expect(thrown).to.be.an('error')
    })

    it('should throw as expected (callback, try/catch)', async () => {
        try {
            await async.each(input, (val, cb) => { cb(new Error(val)) });
        } catch (e) {
            var thrown = e
        }
        expect(thrown).to.be.an('error')
    });

    /*
     * Collections
     */

    it('should return a Promise: each', async () => {
        expect (async.each.name).to.contain('each')
        const calls = []
        await async.each(input, async val => { calls.push(val) });
        expect(calls).to.eql([1, 2, 3])
        expect(async.each(input, asyncIdentity) instanceof Promise).to.equal(true)
    });
    it('should return a Promise: eachSeries', async () => {
        expect (async.eachSeries.name).to.contain('eachSeries')
        const calls = []
        await async.eachSeries(input, async val => { calls.push(val) });
        expect(calls).to.eql([1, 2, 3])
    });
    it('should return a Promise: eachLimit', async () => {
        expect (async.eachLimit.name).to.contain('eachLimit')
        const calls = []
        await async.eachLimit(input, 1, async val => { calls.push(val) });
        expect(calls).to.eql([1, 2, 3])
    });

    it('should return a Promise: eachOf', async () => {
        expect (async.eachOf.name).to.contain('eachOf')
        const calls = []
        await async.eachOf(inputObj, async (...args) => { calls.push(args) });
        expect(calls).to.eql([[1, 'a'], [2, 'b'], [3, 'c']])
    });
    it('should return a Promise: eachOfSeries', async () => {
        expect (async.eachOfSeries.name).to.contain('eachOfSeries')
        const calls = []
        await async.eachOfSeries(inputObj, async (...args) => { calls.push(args) });
        expect(calls).to.eql([[1, 'a'], [2, 'b'], [3, 'c']])
    });
    it('should return a Promise: eachOfLimit', async () => {
        expect (async.eachOfLimit.name).to.contain('eachOfLimit')
        const calls = []
        await async.eachOfLimit(inputObj, 1, async (...args) => { calls.push(args) });
        expect(calls).to.eql([[1, 'a'], [2, 'b'], [3, 'c']])
    });

    it('should return a Promise: concat', async () => {
        expect (async.concat.name).to.contain('concat')
        const calls = []
        await async.concat(inputObj, async (...args) => { calls.push(args) });
        expect(calls).to.eql([[1], [2], [3]])
    });
    it('should return a Promise: concatSeries', async () => {
        expect (async.concatSeries.name).to.contain('concatSeries')
        const calls = []
        await async.concatSeries(inputObj, async (...args) => { calls.push(args) });
        expect(calls).to.eql([[1], [2], [3]])
    });
    it('should return a Promise: concatLimit', async () => {
        expect (async.concatLimit.name).to.contain('concatLimit')
        const calls = []
        await async.concatLimit(inputObj, 1, async (...args) => { calls.push(args) });
        expect(calls).to.eql([[1], [2], [3]])
    });

    it('should return a Promise: detect', async () => {
        expect (async.detect.name).to.contain('detect')
        const calls = []
        await async.detect(input, async (...args) => { calls.push(args); return args[0] === 3 });
        expect(calls).to.eql([[1], [2], [3]])
    });
    it('should return a Promise: detectSeries', async () => {
        expect (async.detectSeries.name).to.contain('detectSeries')
        const calls = []
        await async.detectSeries(input, async (...args) => { calls.push(args); return args[0] === 3 });
        expect(calls).to.eql([[1], [2], [3]])
    });
    it('should return a Promise: detectLimit', async () => {
        expect (async.detectLimit.name).to.contain('detectLimit')
        const calls = []
        await async.detectLimit(input, 1, async (...args) => { calls.push(args); return args[0] === 3 });
        expect(calls).to.eql([[1], [2], [3]])
    });

    it('should return a Promise: every', async () => {
        expect (async.every.name).to.contain('every')
        const calls = []
        await async.every(input, async (...args) => { calls.push(args); return args[0] !== 3 });
        expect(calls).to.eql([[1], [2], [3]])
    });
    it('should return a Promise: everySeries', async () => {
        expect (async.everySeries.name).to.contain('everySeries')
        const calls = []
        await async.everySeries(input, async (...args) => { calls.push(args); return args[0] !== 3 });
        expect(calls).to.eql([[1], [2], [3]])
    });
    it('should return a Promise: everyLimit', async () => {
        expect (async.everyLimit.name).to.contain('everyLimit')
        const calls = []
        await async.everyLimit(input, 1, async (...args) => { calls.push(args); return args[0] !== 3 });
        expect(calls).to.eql([[1], [2], [3]])
    });

    it('should return a Promise: filter', async () => {
        expect (async.filter.name).to.contain('filter')
        const calls = []
        await async.filter(inputObj, async (...args) => { calls.push(args) });
        expect(calls).to.eql([[1], [2], [3]])
    });
    it('should return a Promise: filterSeries', async () => {
        expect (async.filterSeries.name).to.contain('filterSeries')
        const calls = []
        await async.filterSeries(inputObj, async (...args) => { calls.push(args) });
        expect(calls).to.eql([[1], [2], [3]])
    });
    it('should return a Promise: filterLimit', async () => {
        expect (async.filterLimit.name).to.contain('filterLimit')
        const calls = []
        await async.filterLimit(inputObj, 1, async (...args) => { calls.push(args) });
        expect(calls).to.eql([[1], [2], [3]])
    });

    it('should return a Promise: groupBy', async () => {
        expect (async.groupBy.name).to.contain('groupBy')
        const calls = []
        await async.groupBy(inputObj, async (...args) => { calls.push(args) });
        expect(calls).to.eql([[1], [2], [3]])
    });
    it('should return a Promise: groupBySeries', async () => {
        expect (async.groupBySeries.name).to.contain('groupBySeries')
        const calls = []
        await async.groupBySeries(inputObj, async (...args) => { calls.push(args) });
        expect(calls).to.eql([[1], [2], [3]])
    });
    it('should return a Promise: groupByLimit', async () => {
        expect (async.groupByLimit.name).to.contain('groupByLimit')
        const calls = []
        await async.groupByLimit(inputObj, 1, async (...args) => { calls.push(args) });
        expect(calls).to.eql([[1], [2], [3]])
    });

    it('should return a Promise: map', async () => {
        expect (async.map.name).to.contain('map')
        const calls = []
        await async.map(inputObj, async (...args) => { calls.push(args) });
        expect(calls).to.eql([[1], [2], [3]])
    });
    it('should return a Promise: mapSeries', async () => {
        expect (async.mapSeries.name).to.contain('mapSeries')
        const calls = []
        await async.mapSeries(inputObj, async (...args) => { calls.push(args) });
        expect(calls).to.eql([[1], [2], [3]])
    });
    it('should return a Promise: mapLimit', async () => {
        expect (async.mapLimit.name).to.contain('mapLimit')
        const calls = []
        await async.mapLimit(inputObj, 1, async (...args) => { calls.push(args) });
        expect(calls).to.eql([[1], [2], [3]])
    });

    it('should return a Promise: mapValues', async () => {
        expect (async.mapValues.name).to.contain('mapValues')
        const calls = []
        await async.mapValues(inputObj, async (...args) => { calls.push(args) });
        expect(calls).to.eql([[1, 'a'], [2, 'b'], [3, 'c']])
    });
    it('should return a Promise: mapValuesSeries', async () => {
        expect (async.mapValuesSeries.name).to.contain('mapValuesSeries')
        const calls = []
        await async.mapValuesSeries(inputObj, async (...args) => { calls.push(args) });
        expect(calls).to.eql([[1, 'a'], [2, 'b'], [3, 'c']])
    });
    it('should return a Promise: mapValuesLimit', async () => {
        expect (async.mapValuesLimit.name).to.contain('mapValuesLimit')
        const calls = []
        await async.mapValuesLimit(inputObj, 1, async (...args) => { calls.push(args) });
        expect(calls).to.eql([[1, 'a'], [2, 'b'], [3, 'c']])
    });


    it('should return a Promise: reduce', async () => {
        expect (async.reduce.name).to.contain('reduce')
        const calls = []
        await async.reduce(input, 1, async (...args) => calls.push(args));
        expect(calls).to.eql([[1, 1], [1, 2], [2, 3]])
    });
    it('should return a Promise: reduceRight', async () => {
        expect (async.reduceRight.name).to.contain('reduceRight')
        const calls = []
        await async.reduceRight(input, 1, async (...args) => calls.push(args));
        expect(calls).to.eql([[1, 3], [1, 2], [2, 1]])
    });

    it('should return a Promise: reject', async () => {
        expect (async.reject.name).to.contain('reject')
        const calls = []
        await async.reject(inputObj, async (...args) => { calls.push(args) });
        expect(calls).to.eql([[1], [2], [3]])
    });
    it('should return a Promise: rejectSeries', async () => {
        expect (async.rejectSeries.name).to.contain('rejectSeries')
        const calls = []
        await async.rejectSeries(inputObj, async (...args) => { calls.push(args) });
        expect(calls).to.eql([[1], [2], [3]])
    });
    it('should return a Promise: rejectLimit', async () => {
        expect (async.rejectLimit.name).to.contain('rejectLimit')
        const calls = []
        await async.rejectLimit(inputObj, 1, async (...args) => { calls.push(args) });
        expect(calls).to.eql([[1], [2], [3]])
    });
};
