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

    it('should return a Promise: concat', async () => {
        const calls = []
        await async.concat(inputObj, async (...args) => { calls.push(args) });
        expect(calls).to.eql([[1], [2], [3]])
    });
    it('should return a Promise: concatSeries', async () => {
        const calls = []
        await async.concatSeries(inputObj, async (...args) => { calls.push(args) });
        expect(calls).to.eql([[1], [2], [3]])
    });
    it('should return a Promise: concatLimit', async () => {
        const calls = []
        await async.concatLimit(inputObj, 1, async (...args) => { calls.push(args) });
        expect(calls).to.eql([[1], [2], [3]])
    });

    it('should return a Promise: detect', async () => {
        const calls = []
        await async.detect(input, async (...args) => { calls.push(args); return args[0] === 3 });
        expect(calls).to.eql([[1], [2], [3]])
    });
    it('should return a Promise: detectSeries', async () => {
        const calls = []
        await async.detectSeries(input, async (...args) => { calls.push(args); return args[0] === 3 });
        expect(calls).to.eql([[1], [2], [3]])
    });
    it('should return a Promise: detectLimit', async () => {
        const calls = []
        await async.detectLimit(input, 1, async (...args) => { calls.push(args); return args[0] === 3 });
        expect(calls).to.eql([[1], [2], [3]])
    });

    it('should return a Promise: every', async () => {
        const calls = []
        await async.every(input, async (...args) => { calls.push(args); return args[0] !== 3 });
        expect(calls).to.eql([[1], [2], [3]])
    });
    it('should return a Promise: everySeries', async () => {
        const calls = []
        await async.everySeries(input, async (...args) => { calls.push(args); return args[0] !== 3 });
        expect(calls).to.eql([[1], [2], [3]])
    });
    it('should return a Promise: everyLimit', async () => {
        const calls = []
        await async.everyLimit(input, 1, async (...args) => { calls.push(args); return args[0] !== 3 });
        expect(calls).to.eql([[1], [2], [3]])
    });

    it('should return a Promise: filter', async () => {
        const calls = []
        await async.filter(inputObj, async (...args) => { calls.push(args) });
        expect(calls).to.eql([[1], [2], [3]])
    });
    it('should return a Promise: filterSeries', async () => {
        const calls = []
        await async.filterSeries(inputObj, async (...args) => { calls.push(args) });
        expect(calls).to.eql([[1], [2], [3]])
    });
    it('should return a Promise: filterLimit', async () => {
        const calls = []
        await async.filterLimit(inputObj, 1, async (...args) => { calls.push(args) });
        expect(calls).to.eql([[1], [2], [3]])
    });

    it('should return a Promise: groupBy', async () => {
        const calls = []
        await async.groupBy(inputObj, async (...args) => { calls.push(args) });
        expect(calls).to.eql([[1], [2], [3]])
    });
    it('should return a Promise: groupBySeries', async () => {
        const calls = []
        await async.groupBySeries(inputObj, async (...args) => { calls.push(args) });
        expect(calls).to.eql([[1], [2], [3]])
    });
    it('should return a Promise: groupByLimit', async () => {
        const calls = []
        await async.groupByLimit(inputObj, 1, async (...args) => { calls.push(args) });
        expect(calls).to.eql([[1], [2], [3]])
    });

    it('should return a Promise: map', async () => {
        const calls = []
        await async.map(inputObj, async (...args) => { calls.push(args) });
        expect(calls).to.eql([[1], [2], [3]])
    });
    it('should return a Promise: mapSeries', async () => {
        const calls = []
        await async.mapSeries(inputObj, async (...args) => { calls.push(args) });
        expect(calls).to.eql([[1], [2], [3]])
    });
    it('should return a Promise: mapLimit', async () => {
        const calls = []
        await async.mapLimit(inputObj, 1, async (...args) => { calls.push(args) });
        expect(calls).to.eql([[1], [2], [3]])
    });

    it('should return a Promise: mapValues', async () => {
        const calls = []
        await async.mapValues(inputObj, async (...args) => { calls.push(args) });
        expect(calls).to.eql([[1, 'a'], [2, 'b'], [3, 'c']])
    });
    it('should return a Promise: mapValuesSeries', async () => {
        const calls = []
        await async.mapValuesSeries(inputObj, async (...args) => { calls.push(args) });
        expect(calls).to.eql([[1, 'a'], [2, 'b'], [3, 'c']])
    });
    it('should return a Promise: mapValuesLimit', async () => {
        const calls = []
        await async.mapValuesLimit(inputObj, 1, async (...args) => { calls.push(args) });
        expect(calls).to.eql([[1, 'a'], [2, 'b'], [3, 'c']])
    });


    it('should return a Promise: reduce', async () => {
        const calls = []
        await async.reduce(input, 1, async (...args) => calls.push(args));
        expect(calls).to.eql([[1, 1], [1, 2], [2, 3]])
    });
    it('should return a Promise: reduceRight', async () => {
        const calls = []
        await async.reduceRight(input, 1, async (...args) => calls.push(args));
        expect(calls).to.eql([[1, 3], [1, 2], [2, 1]])
    });

    it('should return a Promise: reject', async () => {
        const calls = []
        await async.reject(inputObj, async (...args) => { calls.push(args) });
        expect(calls).to.eql([[1], [2], [3]])
    });
    it('should return a Promise: rejectSeries', async () => {
        const calls = []
        await async.rejectSeries(inputObj, async (...args) => { calls.push(args) });
        expect(calls).to.eql([[1], [2], [3]])
    });
    it('should return a Promise: rejectLimit', async () => {
        const calls = []
        await async.rejectLimit(inputObj, 1, async (...args) => { calls.push(args) });
        expect(calls).to.eql([[1], [2], [3]])
    });

    it('should return a Promise: some', async () => {
        const calls = []
        await async.some(input, async (...args) => { calls.push(args); return args[0] === 3 });
        expect(calls).to.eql([[1], [2], [3]])
    });
    it('should return a Promise: someSeries', async () => {
        const calls = []
        await async.someSeries(input, async (...args) => { calls.push(args); return args[0] === 3 });
        expect(calls).to.eql([[1], [2], [3]])
    });
    it('should return a Promise: someLimit', async () => {
        const calls = []
        await async.someLimit(input, 1, async (...args) => { calls.push(args); return args[0] === 3 });
        expect(calls).to.eql([[1], [2], [3]])
    });

    it('should return a Promise: sortBy', async () => {
        const calls = []
        await async.sortBy(input, async (...args) => { calls.push(args) });
        expect(calls).to.eql([[1], [2], [3]])
    });

    it('should return a Promise: times', async () => {
        const calls = []
        await async.times(3, async (...args) => { calls.push(args); return args[0] === 3 });
        expect(calls).to.eql([[0], [1], [2]])
    });
    it('should return a Promise: timesSeries', async () => {
        const calls = []
        await async.timesSeries(3, async (...args) => { calls.push(args); return args[0] === 3 });
        expect(calls).to.eql([[0], [1], [2]])
    });
    it('should return a Promise: timesLimit', async () => {
        const calls = []
        await async.timesLimit(3, 1, async (...args) => { calls.push(args); return args[0] === 3 });
        expect(calls).to.eql([[0], [1], [2]])
    });

    it('should return a Promise: transform', async () => {
        const calls = []
        await async.transform(inputObj, 1, async (...args) => calls.push(args));
        expect(calls).to.eql([[1, 1, 'a'], [1, 2, 'b'], [1, 3, 'c']])
    });
    it('should return a Promise: transform (2 args)', async () => {
        const calls = []
        await async.transform(inputObj, async (...args) => calls.push(args));
        expect(calls).to.eql([[{}, 1, 'a'], [{}, 2, 'b'], [{}, 3, 'c']])
    });

    /*
     * Control flow
     */

    it('should return a Promise: applyEach', async () => {
        const calls = []
        await async.applyEach([
            async (v, x) => { calls.push(v, x) },
            async (v, x) => { calls.push(v, x) }
        ], 5, 6)();
        expect(calls).to.eql([5, 6, 5, 6])
    })
    it('should return a Promise: applyEachSeries', async () => {
        const calls = []
        await async.applyEachSeries([
            async (v, x) => { calls.push(v, x) },
            async (v, x) => { calls.push(v, x) }
        ], 5, 6)();
        expect(calls).to.eql([5, 6, 5, 6])
    })

    it('should return a Promise: auto', async () => {
        const calls = []
        await async.auto({
            async a () {
                calls.push('a')
                return Promise.resolve('a')
            },
            b: ['a', 'c', async () => calls.push('b')],
            async c () {
                await Promise.resolve()
                calls.push('c')
                return Promise.resolve('c')
            }
        });
        expect(calls).to.eql(['a', 'c', 'b'])
    });
    it('should return a Promise: autoInject', async () => {
        const calls = []
        await async.autoInject({
            async a () {
                calls.push('a')
                return 'a'
            },
            async b(a, c) { calls.push('b'); calls.push(a, c) },
            async c () {
                calls.push('c')
                return 'c'
            }
        }, 1);
        expect(calls).to.eql(['a', 'c', 'b', 'a', 'c'])
    });

    it('should return a Promise: compose', async () => {
        const calls = []
        const fn = async.compose(
            async (...args) => calls.push('a', args),
            async (...args) => calls.push('b', args)
        );
        const result = await fn(1, 2)
        expect(calls).to.eql(['b', [1, 2], 'a', [2]])
        expect(result).to.eql(4)
    });
    it('should return a Promise: seq', async () => {
        const calls = []
        const fn = async.seq(
            async (...args) => calls.push('a', args),
            async (...args) => calls.push('b', args)
        );
        const result = await fn(1, 2)
        expect(calls).to.eql(['a', [1, 2], 'b', [2]])
        expect(result).to.eql(4)
    });

    it('should return a Promise: whilst', async () => {
        const calls = []
        let counter = 0
        await async.whilst(
            async () => {calls.push('test', counter); return counter < 5},
            async () => { calls.push('fn'); counter++ }
        );
        expect(calls).to.eql([
            'test', 0, 'fn',
            'test', 1, 'fn',
            'test', 2, 'fn',
            'test', 3, 'fn',
            'test', 4, 'fn',
            'test', 5
        ])
    });
    it('should return a Promise: until', async () => {
        const calls = []
        let counter = 0
        await async.until(
            async () => {calls.push('test', counter); return counter === 5},
            async () => { calls.push('fn'); counter++ }
        );
        expect(calls).to.eql([
            'test', 0, 'fn',
            'test', 1, 'fn',
            'test', 2, 'fn',
            'test', 3, 'fn',
            'test', 4, 'fn',
            'test', 5
        ])
    });
    it('should return a Promise: doWhilst', async () => {
        const calls = []
        let counter = 0
        await async.doWhilst(
            async () => { calls.push('fn'); counter++ },
            async () => {calls.push('test', counter); return counter < 5}
        );
        expect(calls).to.eql([
            'fn',
            'test', 1, 'fn',
            'test', 2, 'fn',
            'test', 3, 'fn',
            'test', 4, 'fn',
            'test', 5
        ])
    });
    it('should return a Promise: doUntil', async () => {
        const calls = []
        let counter = 0
        await async.doUntil(
            async () => { calls.push('fn'); counter++ },
            async () => {calls.push('test', counter); return counter === 5}
        );
        expect(calls).to.eql([
            'fn',
            'test', 1, 'fn',
            'test', 2, 'fn',
            'test', 3, 'fn',
            'test', 4, 'fn',
            'test', 5
        ])
    });

    it('should return a Promise: forever', async () => {
        const calls = []
        let counter = 0
        try {
            await async.forever(async () => {
                calls.push(counter)
                counter++
                await Promise.resolve()
                if (counter === 5) throw new Error()
            })
        } catch (e) {
            var err = e
        }
        expect(calls).to.eql([0, 1, 2, 3, 4])
        expect(err).to.be.an('error')
    });

    it('should return a Promise: parallel', async () => {
        const calls = []
        await async.parallel([
            async () => { await Promise.resolve(); calls.push(1) },
            async () => { await Promise.resolve(); calls.push(1) },
            async () => { await Promise.resolve(); calls.push(1) },
            async () => { await Promise.resolve(); calls.push(1) },
        ])
        expect(calls).to.eql([1, 1, 1, 1])
    });
    it('should return a Promise: parallelLimit', async () => {
        const calls = []
        await async.parallelLimit([
            async () => { await Promise.resolve(); calls.push(1) },
            async () => { await Promise.resolve(); calls.push(1) },
            async () => { await Promise.resolve(); calls.push(1) },
            async () => { await Promise.resolve(); calls.push(1) },
        ], 2)
        expect(calls).to.eql([1, 1, 1, 1])
    });
    it('should return a Promise: series', async () => {
        const calls = []
        await async.series([
            async () => { await Promise.resolve(); calls.push(1) },
            async () => { await Promise.resolve(); calls.push(1) },
            async () => { await Promise.resolve(); calls.push(1) },
            async () => { await Promise.resolve(); calls.push(1) },
        ], 2)
        expect(calls).to.eql([1, 1, 1, 1])
    });

    it('should return a Promise: race', async () => {
        const calls = []
        await async.race([
            async () => { await Promise.resolve(); calls.push(1) },
            async () => { await Promise.resolve(); calls.push(1) },
            async () => { await Promise.resolve(); calls.push(1) },
            async () => { await Promise.resolve(); calls.push(1) },
        ], 2)
        expect(calls).to.eql([1, 1, 1, 1])
    });

    it('should return a Promise: retryable', async () => {
        let counter = 0
        const calls = []
        const fn = async.retryable(async (a, b) => {
            calls.push(a, b)
            counter++
            if (counter < 3) throw new Error()
        })
        const promise = fn(1, 2)
        expect(promise.then).to.be.a('function')
        await promise
        expect(calls).to.eql([1, 2, 1, 2, 1, 2])
    });
    it('should return a Promise: retryable (arity 0)', async () => {
        let counter = 0
        const calls = []
        const fn = async.retryable({times: 5}, async () => {
            calls.push(0)
            counter++
            if (counter < 3) throw new Error()
        })
        await fn()
        expect(calls).to.eql([0, 0, 0])
    });

    it('should return a Promise: retry', async () => {
        let counter = 0
        const calls = []
        await async.retry(async () => {
            calls.push(counter)
            counter++
            if (counter < 3) throw new Error()
        })
        expect(calls).to.eql([0, 1, 2])
    });

    it('should return a Promise: retry (multiple cb args)', async () => {
        let counter = 0
        const results = await async.retry((cb) => {
            counter++
            if (counter < 3) return cb(new Error())
            cb(null, 0, 1, 2)
        })
        expect(results).to.eql([0, 1, 2])
    });

    it('should return a Promise: tryEach', async () => {
        const calls = []
        await async.tryEach([
            async () => { await Promise.resolve(); calls.push(1); throw new Error() },
            async () => { await Promise.resolve(); calls.push(2); throw new Error() },
            async () => { await Promise.resolve(); calls.push(3) },
            async () => { await Promise.resolve(); calls.push(4) },
        ], 2)
        expect(calls).to.eql([1, 2, 3])
    });

    it('should return a Promise: waterfall', async () => {
        const calls = []
        await async.waterfall([
            async () => { await Promise.resolve(); calls.push(1) },
            async () => { await Promise.resolve(); calls.push(2) },
            async () => { await Promise.resolve(); calls.push(3) },
            async () => { await Promise.resolve(); calls.push(4) },
        ], 2)
        expect(calls).to.eql([1, 2, 3, 4])
    });

    it('should work with queues', async () => {
        const q = async.queue(async (data) => {
            if (data === 2) throw new Error('oh noes')
            await new Promise(resolve => setTimeout(() => resolve(data), 10))
            return data
        }, 5)

        const calls = []
        const errorCalls = []
        const emptyCalls = []
        q.error().catch(d => errorCalls.push('error ' + d))
        q.saturated().then(() => calls.push('saturated'))
        q.unsaturated().then(() => calls.push('unsaturated'))
        q.empty().then(() => emptyCalls.push('empty'))

        q.push(1).then(d => calls.push('push cb ' + d))
        q.push(2).then(d => errorCalls.push('push cb ' + d))
        q.push([3, 4, 5, 6]).map(p => p.then(d => calls.push('push cb ' + d)))
        q.push(7).then(d => calls.push('push cb ' + d))
        q.push(8).then(d => calls.push('push cb ' + d))

        const multiP = Promise.all(q.push([9, 10]))

        await q.drain()
        const res = await multiP
        expect(calls.join()).to.eql([
            'saturated',
            'push cb 1',
            'push cb 3',
            'push cb 4',
            'push cb 5',
            'push cb 6',
            'push cb 7',
            'unsaturated',
            'push cb 8'
        ].join())

        expect(errorCalls).to.eql([
            'push cb undefined',
            'error Error: oh noes',
        ])
        expect(emptyCalls).to.eql([
            'empty',
        ])

        expect(res).to.eql([
            9,
            10
        ])
    })

    it('should work with priorityQueues', async () => {
        const q = async.priorityQueue(async (data) => {
            if (data === 2) throw new Error('oh noes')
            await new Promise(resolve => setTimeout(() => resolve(data), 10))
            return data
        }, 5)

        const calls = []
        const errorCalls = []
        const emptyCalls = []
        q.error().catch(d => errorCalls.push('error ' + d))
        q.saturated().then(() => calls.push('saturated'))
        q.unsaturated().then(() => calls.push('unsaturated'))
        q.empty().then(() => emptyCalls.push('empty'))

        q.push(1, 1).then(d => calls.push('push cb ' + d))
        q.push(2, 1).then(d => errorCalls.push('push cb ' + d))
        q.push([3, 4, 5, 6], 0).map(p => p.then(d => calls.push('push cb ' + d)))
        q.push(7, 3).then(d => calls.push('push cb ' + d))
        q.push(8, 3).then(d => calls.push('push cb ' + d))

        const multiP = Promise.all(q.push([9, 10], 1))

        await q.drain()
        const res = await multiP
        expect(calls.join()).to.eql([
            'saturated',
            'push cb 3',
            'push cb 4',
            'push cb 5',
            'push cb 6',
            'push cb 1',
            'unsaturated',
            'push cb 7',
            'push cb 8'
        ].join())

        expect(errorCalls).to.eql([
            'push cb undefined',
            'error Error: oh noes',
        ])
        expect(emptyCalls).to.eql([
            'empty',
        ])

        expect(res).to.eql([
            9,
            10
        ])
    })

    /*
     * Util
     */


};
