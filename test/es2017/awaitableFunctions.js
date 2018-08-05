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


    /*
     * Collections
     */

    it('should return a Promise: each', async () => {
        const calls = []
        await async.each(input, async val => { calls.push(val) });
        expect(calls).to.eql([1, 2, 3])
        expect(async.each(input, asyncIdentity) instanceof Promise).to.equal(true)
    });
    it('should return a Promise: eachSeries', async () => {
        const calls = []
        await async.eachSeries(input, async val => { calls.push(val) });
        expect(calls).to.eql([1, 2, 3])
    });
    it('should return a Promise: eachLimit', async () => {
        const calls = []
        await async.eachLimit(input, 1, async val => { calls.push(val) });
        expect(calls).to.eql([1, 2, 3])
    });

    it('should return a Promise: eachOf', async () => {
        const calls = []
        await async.eachOf(inputObj, async (...args) => { calls.push(args) });
        expect(calls).to.eql([[1, 'a'], [2, 'b'], [3, 'c']])
    });
    it('should return a Promise: eachOfSeries', async () => {
        const calls = []
        await async.eachOfSeries(inputObj, async (...args) => { calls.push(args) });
        expect(calls).to.eql([[1, 'a'], [2, 'b'], [3, 'c']])
    });
    it('should return a Promise: eachOfLimit', async () => {
        const calls = []
        await async.eachOfLimit(inputObj, 1, async (...args) => { calls.push(args) });
        expect(calls).to.eql([[1, 'a'], [2, 'b'], [3, 'c']])
    });
};
