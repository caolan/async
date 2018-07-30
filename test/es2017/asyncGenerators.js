var async = require('../../lib');
const {expect} = require('chai');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

module.exports = function () {
    async function * range (num) {
        for(let i = 0; i < num; i++) {
            await delay(1)
            yield i
        }
    }

    function AsyncIterable (size) {
        // cant use method shorthand because babel doesnt parse it right
        async function * iterator () {
            let idx = 0
            while (idx < size) {
                yield idx
                await delay(1)
                idx++
            }
        }
        return {
            [Symbol.asyncIterator]: iterator
        }
    }

    it('should handle async generators in each', (done) => {
        const calls = []
        async.each(range(5),
            async (val) => {
                calls.push(val)
                await delay(5)
            }, (err) => {
                if (err) throw err
                expect(calls).to.eql([0, 1, 2, 3, 4])
                done()
            }
        )
    });

    it('should handle async generators in eachLimit', (done) => {
        const calls = []
        async.eachLimit(range(5), 2,
            async (val) => {
                calls.push(val)
                await delay(5)
            }, (err) => {
                if (err) throw err
                expect(calls).to.eql([0, 1, 2, 3, 4])
                done()
            }
        )
    });

    it('should handle async generators in eachSeries', (done) => {
        const calls = []
        async.eachSeries(range(5),
            async (val) => {
                calls.push(val)
                await delay(5)
            }, (err) => {
                if (err) throw err
                expect(calls).to.eql([0, 1, 2, 3, 4])
                done()
            }
        )
    });


    it('should handle async iterables in each', (done) => {
        const calls = []
        async.each(new AsyncIterable(5),
            async (val) => {
                calls.push(val)
                await delay(5)
            }, (err) => {
                if (err) throw err
                expect(calls).to.eql([0, 1, 2, 3, 4])
                done()
            }
        )
    });
}
