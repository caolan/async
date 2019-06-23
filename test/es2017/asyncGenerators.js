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

    this.retries(3);

    it('should handle async generators in each', (done) => {
        const calls = []
        async.each(range(5),
            async (val) => {
                calls.push(val)
                await delay(1)
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

    it('should handle async iterables in each (errors)', (done) => {
        const calls = []
        async.each(new AsyncIterable(5),
            async (val) => {
                calls.push(val)
                if (val === 3) throw new Error('fail')
                await delay(5)
            }, (err) => {
                expect(err.message).to.equal('fail')
                expect(calls).to.eql([0, 1, 2, 3])
                done()
            }
        )
    })

    it('should handle async iterables in each (cancelled)', async () => {
        const calls = []
        async.each(new AsyncIterable(5),
            (val, cb) => {
                calls.push(val)
                if (val === 2) cb(false)
                cb()
            }, () => {
                throw new Error('should not get here')
            }
        )
        await delay(20)
        expect(calls).to.eql([0, 1, 2])
    })
}
