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
};
