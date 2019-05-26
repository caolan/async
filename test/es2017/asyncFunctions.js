var async = require('../../lib');
const {expect} = require('chai');
const assert = require('assert');


module.exports = function () {
    async function asyncIdentity(val) {
        var res = await Promise.resolve(val);
        return res;
    }

    this.retries(3);

    const input = [1, 2, 3];
    const inputObj = {a: 1, b: 2, c: 3};

    it('should asyncify async functions', (done) => {
        async.asyncify(asyncIdentity)(42, (err, val) => {
            assert(val === 42);
            done(err);
        })
    });

    it('should handle errors in async functions', (done) => {
        async.asyncify(async () => {
            throw new Error('thrown error')
        })((err) => {
            assert(err.message = 'thrown error');
            done();
        })
    });

    /*
     * Collections
     */

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

    it('should handle async functions in concatLimit', (done) => {
        async.concatLimit(input, 2, asyncIdentity, (err, result) => {
            expect(err).to.eql(null);
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
        async.reduce(input, 0, async (acc, val) => {
            var res = await Promise.resolve(acc + val);
            return res;
        },
        (err, result) => {
            expect(result).to.eql(6);
            done(err);
        });
    });

    it('should handle async functions in reduceRight', (done) => {
        async.reduceRight(input, 0, async (acc, val) => {
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
        async.transform(inputObj, async (obj, val, key) => {
            obj[key] = await Promise.resolve(val);
        }, (err, result) => {
            expect(result).to.eql(inputObj);
            done(err);
        });
    });

    /*
     * Control Flow
     */

    it('should handle async functions in applyEach', (done) => {
        async.applyEach([asyncIdentity, asyncIdentity], input)((err, result) => {
            expect(result).to.eql([input, input]);
            done(err);
        });
    });

    it('should handle async functions in applyEachSeries', (done) => {
        async.applyEachSeries([asyncIdentity, asyncIdentity], input)((err, result) => {
            expect(result).to.eql([input, input]);
            done(err);
        });
    });

    it('should handle async functions in auto', (done) => {
        async.auto({
            async a () {
                return await Promise.resolve(1);
            },
            async b () {
                return await Promise.resolve(2);
            },
            c: ['a', 'b', async function (results) {
                return await Promise.resolve(results.a + results.b);
            }]
        }, (err, result) => {
            expect(result).to.eql({a: 1, b: 2, c: 3});
            done(err);
        });
    });

    /* eslint prefer-arrow-callback: 0, object-shorthand: 0 */
    it('should handle async functions in autoInject', (done) => {
        async.autoInject({
            z: async function () { return 0 },
            a: async function () {
                return 1;
            },
            b: function (a, next) {
                next(null, a + 1);
            },
            async c(a, b) {
                return await Promise.resolve(a + b);
            },
            d: async c => {
                return await Promise.resolve(c + 1);
            }
        }, (err, result) => {
            expect(result).to.eql({z: 0, a: 1, b: 2, c: 3, d: 4});
            done(err);
        });
    });

    it('should handle async functions in autoInject (shorthand)', (done) => {
        async.autoInject({
            async a() {
                return await Promise.resolve(1);
            },
            async b(a) {
                return await Promise.resolve(a + 1);
            },
            async c(a, b) {
                return await Promise.resolve(a + b);
            },
            async d(c) {
                return await Promise.resolve(c + 1);
            }
        }, (err, result) => {
            expect(result).to.eql({a: 1, b: 2, c: 3, d: 4});
            done(err);
        });
    });

    it('should handle async functions in cargo', (done) => {
        var result = [];
        var q = async.cargo(async (val) => {
            result.push(await Promise.resolve(val));
        }, 2)

        q.drain(() => {
            expect(result).to.eql([[1, 2], [3]]);
            done();
        });

        q.push(1);
        q.push(2);
        q.push(3);
    });

    it('should handle async functions in queue', (done) => {
        var result = [];
        var q = async.queue(async (val) => {
            result.push(await Promise.resolve(val));
        }, 2)

        q.drain(() => {
            expect(result).to.eql([1, 2, 3]);
            done();
        });

        q.push(1);
        q.push(2);
        q.push(3);
    });

    it('should handle async functions in priorityQueue', (done) => {
        var result = [];
        var q = async.priorityQueue(async (val) => {
            result.push(await Promise.resolve(val));
        }, 2)

        q.drain(() => {
            expect(result).to.eql([1, 2, 3]);
            done();
        });

        q.push(1);
        q.push(2);
        q.push(3);
    });

    it('should handle async functions in compose', (done) => {
        async.compose(
            async (a) => a + 1,
            async (a) => a + 1,
            async (a) => a + 1
        )(0, (err, result) => {
            expect(result).to.equal(3);
            done(err);
        });
    });

    it('should handle async functions in seq', (done) => {
        async.seq(
            async (a) => a + 1,
            async (a) => a + 1,
            async (a) => a + 1
        )(0, (err, result) => {
            expect(result).to.equal(3);
            done(err);
        });
    });

    it('should handle async functions in whilst', (done) => {
        var val = 0;
        async.whilst(async () => val < 3,
            async () => {
                val += 1;
                return val;
            }, done);
    });

    it('should handle async functions in doWhilst', (done) => {
        var val = 0;
        async.doWhilst(async () => {
            val += 1;
            return val;
        }, async (res) => res < 3, done);
    });

    it('should handle async functions in until', (done) => {
        var val = 0;
        async.until(async () => val > 3,
            async () => {
                val += 1;
                return val;
            }, done);
    });

    it('should handle async functions in doUntil', (done) => {
        var val = 0;
        async.doUntil(async () => {
            val += 1;
            return val;
        }, async (res) => res > 3, done);
    });

    it('should handle async functions in forever', (done) => {
        var counter = 0;
        async.forever(async () => {
            counter += 1;
            if (counter > 10) throw new Error('too big');
        },(err) => {
            expect(err.message).to.equal('too big');
            done();
        })
    });

    it('should handle async functions in parallel', (done) => {
        async.parallel([
            async () => 1,
            async () => 2,
            async () => 3
        ], (err, result) => {
            expect(result).to.eql([1, 2, 3]);
            done(err);
        })
    });

    it('should handle async functions in parallel (object)', (done) => {
        async.parallel({
            a: async () => 1,
            b: async () => 2,
            c: async () => 3
        }, (err, result) => {
            expect(result).to.eql({a: 1, b: 2, c: 3});
            done(err);
        })
    });

    it('should handle async functions in parallelLimit', (done) => {
        async.parallelLimit([
            async () => 1,
            async () => 2,
            async () => 3
        ], 2, (err, result) => {
            expect(result).to.eql([1, 2, 3]);
            done(err);
        })
    });

    it('should handle async functions in parallelLimit (object)', (done) => {
        async.parallelLimit({
            a: async () => 1,
            b: async () => 2,
            c: async () => 3
        }, 2, (err, result) => {
            expect(result).to.eql({a: 1, b: 2, c: 3});
            done(err);
        })
    });

    it('should handle async functions in series', (done) => {
        async.series([
            async () => 1,
            async () => 2,
            async () => 3
        ], (err, result) => {
            expect(result).to.eql([1, 2, 3]);
            done(err);
        })
    });

    it('should handle async functions in series (object)', (done) => {
        async.series({
            a: async () => 1,
            b: async () => 2,
            c: async () => 3
        }, (err, result) => {
            expect(result).to.eql({a: 1, b: 2, c: 3});
            done(err);
        })
    });

    it('should handle async functions in race', (done) => {
        async.race([
            async () => 1,
            async () => 2,
            async () => 3
        ], (err, result) => {
            expect(result).to.eql(1);
            done(err);
        })
    });

    it('should handle async functions in retry', (done) => {
        var count = 0;
        async.retry(4, async () => {
            count += 1;
            if (count < 3) throw new Error('fail');
            return count;
        }, (err, result) => {
            expect(result).to.eql(3);
            done(err);
        })
    });

    it('should handle async functions in retryable', (done) => {
        var count = 0;
        async.retryable(4, async () => {
            count += 1;
            if (count < 3) throw new Error('fail');
            return count;
        })((err, result) => {
            expect(result).to.eql(3);
            done(err);
        })
    });

    it('should handle async functions in times', (done) => {
        var count = 0;
        async.times(4, async () => {
            count += 1;
            return count;
        }, (err, result) => {
            expect(result).to.eql([1, 2, 3, 4]);
            done(err);
        })
    });

    it('should handle async functions in timesLimit', (done) => {
        var count = 0;
        async.timesLimit(4, 2, async () => {
            count += 1;
            return count;
        }, (err, result) => {
            expect(result).to.eql([1, 2, 3, 4]);
            done(err);
        })
    });

    it('should handle async functions in timesSeries', (done) => {
        var count = 0;
        async.timesSeries(4, async () => {
            count += 1;
            return count;
        }, (err, result) => {
            expect(result).to.eql([1, 2, 3, 4]);
            done(err);
        })
    });

    it('should handle async functions in waterfall', (done) => {
        async.waterfall([
            async () => 1,
            async (a) => a + 1,
            async (a) => [a, a + 1],
            async ([a, b]) => a + b,
        ], (err, result) => {
            expect(result).to.eql(5);
            done(err);
        })
    });

    it('should handle async functons in tryEach', (done) => {
        async.tryEach([
            async () => { throw new Error('fail1'); },
            async () => { throw new Error('fail2'); },
            async () => 5,
            async () => { throw new Error('shoult not get here'); }
        ], (err, result) => {
            expect(result).to.eql(5);
            done();
        })
    });

    /**
     * Utils
     */

    it('should handle async functions in dir', (done) => {
        async.dir(async (val) => val, 'foo');
        setTimeout(done);
    });

    it('should handle async functions in log', (done) => {
        async.log(async (val) => val, 'foo');
        setTimeout(done);
    });

    it('should handle async functions in ensureAsync', () => {
        var fn = async.ensureAsync(asyncIdentity);
        assert(fn === asyncIdentity);
    });

    it('should handle async functions in memoize', (done) => {
        var fn = async.memoize(asyncIdentity);
        fn(1, () => {
            fn(1, done);
        })
    });

    it('should handle async functions in reflect', (done) => {
        var fn = async.reflect(asyncIdentity);
        fn(1, (err, result) => {
            expect(result).to.eql({value: 1});
            done(err);
        })
    });

    it('should handle async functions in reflect (error case)', (done) => {
        var thrown;
        var fn = async.reflect(async () => {
            thrown = new Error('foo');
            throw thrown;
        });
        fn(1, (err, result) => {
            expect(result).to.eql({
                error: thrown,
                value: undefined
            });
            done(err);
        })
    });

    it('should handle async functions in timeout', (done) => {
        var fn = async.timeout(asyncIdentity, 50);
        fn(1, (err, result) => {
            expect(result).to.eql(1);
            done(err);
        })
    });

    it('should handle async functions in timeout (error case)', (done) => {
        var fn = async.timeout(async (val) => {
            await new Promise((resolve) => setTimeout(resolve, 100));
            return val;
        }, 20);
        fn(1, (err) => {
            expect(err.message).to.match(/timed out/);
            done();
        })
    });
}
