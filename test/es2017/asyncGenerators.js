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
}
