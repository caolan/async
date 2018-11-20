var async = require('../lib');
var {expect} = require('chai');
var assert = require('assert');

describe('groupBy', function() {
    this.timeout(250);

    function groupByIteratee(callOrder, val, next) {
        setTimeout(() => {
            callOrder.push(val);
            next(null, val+1);
        }, val * 25);
    }

    context('groupBy', () => {
        it('basics', function(done) {
            var callOrder = [];
            async.groupBy([1, 3, 2], groupByIteratee.bind(this, callOrder), (err, result) => {
                expect(err).to.eql(null);
                expect(callOrder).to.eql([1, 2, 3]);
                expect(result).to.eql({2: [1], 3: [2], 4: [3]});
                done();
            });
        });

        it('error', (done) => {
            async.groupBy([1, 3, 2], (val, next) => {
                if (val === 3) {
                    return next(new Error('fail'));
                }
                next(null, val+1);
            }, (err, result) => {
                expect(err).to.not.eql(null);
                expect(result).to.eql({2: [1]});
                done();
            });
        });

        it('canceled', (done) => {
            var callOrder = [];
            async.groupBy([1, 3, 2], (val, next) => {
                callOrder.push(val);
                if (val === 3) {
                    return next(false, val+1);
                }
                next(null, val+1);
            }, () => {
                throw new Error('should not get here');
            });

            setTimeout(() => {
                expect(callOrder).to.eql([1, 3]);
                done();
            }, 25);
        });

        it('original untouched', (done) => {
            var obj = {a: 'b', b: 'c', c: 'd'};
            async.groupBy(obj, (val, next) => {
                next(null, val);
            }, (err, result) => {
                expect(obj).to.eql({a: 'b', b: 'c', c: 'd'});
                expect(result).to.eql({b: ['b'], c: ['c'], d: ['d']});
                done();
            });
        });

        it('handles multiple matches', function(done) {
            var callOrder = [];
            async.groupBy([1, 3, 2, 2], groupByIteratee.bind(this, callOrder), (err, result) => {
                expect(err).to.eql(null);
                expect(callOrder).to.eql([1, 2, 2, 3]);
                expect(result).to.eql({2: [1], 3: [2, 2], 4: [3]});
                done();
            });
        });

        it('handles objects', (done) => {
            var obj = {a: 'b', b: 'c', c: 'd'};
            var concurrency = {b: 3, c: 2, d: 1};
            var running = 0;
            async.groupBy(obj, (val, next) => {
                running++;
                async.setImmediate(() => {
                    expect(running).to.equal(concurrency[val]);
                    running--;
                    next(null, val);
                });
            }, (err, result) => {
                expect(running).to.equal(0);
                expect(err).to.eql(null);
                expect(result).to.eql({b: ['b'], c: ['c'], d: ['d']});
                done();
            });
        });

        it('handles undefined', (done) => {
            async.groupBy(undefined, (val, next) => {
                assert(false, 'iteratee should not be called');
                next();
            }, (err, result) => {
                expect(err).to.eql(null);
                expect(result).to.eql({});
                done();
            });
        });

        it('handles empty object', (done) => {
            async.groupBy({}, (val, next) => {
                assert(false, 'iteratee should not be called');
                next();
            }, (err, result) => {
                expect(err).to.eql(null);
                expect(result).to.eql({});
                done();
            });
        });

        it('main callback optional' , (done) => {
            var arr = [1, 2, 3];
            var runs = [];
            async.groupBy(arr, (val, next) => {
                runs.push(val);
                var _done = (runs.length === arr.length);
                async.setImmediate(() => {
                    next(null);
                    if (_done) {
                        expect(runs).to.eql(arr);
                        done();
                    }
                });
            });
        });

        it('iteratee callback is only called once', (done) => {
            async.groupBy([1, 2], (item, callback) => {
                try {
                    callback(item);
                } catch (exception) {
                    expect(() => {
                        callback(exception);
                    }).to.throw(/already called/);
                    done();
                }
            }, () => {
                throw new Error();
            });
        });

        it('handles Map', (done) => {
            if (typeof Map !== 'function') {
                return done();
            }

            var map = new Map([
                ['a', 'a'],
                ['b', 'b'],
                ['c', 'a']
            ]);

            async.groupBy(map, (val, next) => {
                next(null, val[1]+1);
            }, (err, result) => {
                expect(err).to.eql(null);
                expect(result).to.eql({
                    a1: [ ['a', 'a'], ['c', 'a']],
                    b1: [ ['b', 'b'] ]
                });
                done();
            });
        });

        it('handles sparse results', (done) => {
            var arr = [1, 2, 3];
            async.groupBy(arr, (val, next) => {
                if (val === 1) {
                    return next(null, val+1);
                } else if (val === 2) {
                    async.setImmediate(() => {
                        return next(null, val+1);
                    });
                } else {
                    return next('error');
                }
            }, (err, result) => {
                expect(err).to.not.eql(null);
                expect(result).to.eql({2: [1]});
                async.setImmediate(done);
            });
        });
    });

    context('groupByLimit', () => {
        var obj = {a: 'b', b: 'c', c: 'd'};
        it('basics', (done) => {
            var running = 0;
            var concurrency = {'b': 2, 'c': 2, 'd': 1};
            async.groupByLimit(obj, 2, (val, next) => {
                running++;
                async.setImmediate(() => {
                    expect(running).to.equal(concurrency[val]);
                    running--;
                    next(null, val);
                });
            }, (err, result) => {
                expect(running).to.equal(0);
                expect(err).to.eql(null);
                expect(result).to.eql({'b': ['b'], 'c': ['c'], 'd': ['d']})
                done();
            });
        });

        it('error', (done) => {
            async.groupByLimit(obj, 1, (val, next) => {
                if (val === 'c') {
                    return next(new Error('fail'));
                }
                next(null, val);
            }, (err, result) => {
                expect(err).to.not.eql(null);
                expect(result).to.eql({b: ['b']});
                done();
            });
        });

        it('canceled', (done) => {
            var callOrder = [];
            async.groupByLimit([1, 1, 2, 2, 3], 2, (val, next) => {
                callOrder.push(val);
                async.setImmediate(() => {
                    if (val === 2) {
                        return next(false, val+1);
                    }
                    next(null, val+1);
                });
            }, () => {
                throw new Error('should not get here');
            });

            setTimeout(() => {
                expect(callOrder).to.eql([1, 1, 2, 2]);
                done();
            }, 50);
        });

        it('handles empty object', (done) => {
            async.groupByLimit({}, 2, (val, next) => {
                assert(false, 'iteratee should not be called');
                next();
            }, (err, result) => {
                expect(err).to.eql(null);
                expect(result).to.eql({});
                done();
            });
        });

        it('handles undefined', (done) => {
            async.groupByLimit(undefined, 2, (val, next) => {
                assert(false, 'iteratee should not be called');
                next();
            }, (err, result) => {
                expect(err).to.eql(null);
                expect(result).to.eql({});
                done();
            });
        });

        it('limit exceeds size', function(done) {
            var callOrder = [];
            async.groupByLimit([3, 2, 2, 1], 10, groupByIteratee.bind(this, callOrder), (err, result) => {
                expect(err).to.eql(null);
                expect(result).to.eql({2: [1], 3: [2, 2], 4: [3]});
                expect(callOrder).to.eql([1, 2, 2, 3]);
                done();
            });
        });

        it('limit equal size', function(done) {
            var callOrder = [];
            async.groupByLimit([3, 2, 2, 1], 4, groupByIteratee.bind(this, callOrder), (err, result) => {
                expect(err).to.eql(null);
                expect(result).to.eql({2: [1], 3: [2, 2], 4: [3]});
                expect(callOrder).to.eql([1, 2, 2, 3]);
                done();
            });
        });

        it('zero limit', () => {
            expect(() => {
                async.groupByLimit([3, 2, 2, 1], 0, (val, next) => {
                    assert(false, 'iteratee should not be called');
                    next();
                }, () => {
                    assert(false, 'should not be called');
                });
            }).to.throw(/concurrency limit/)
        });

        it('does not continue replenishing after error', (done) => {
            var started = 0;
            var arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
            var delay = 10;
            var limit = 3;
            var maxTime = 10 * arr.length;

            async.groupByLimit(arr, limit, (val, next) => {
                started++;
                if (started === 3) {
                    return next(new Error('fail'));
                }

                setTimeout(() => {
                    next();
                }, delay);
            }, (err, result) => {
                expect(err).to.not.eql(null);
                expect(result).to.eql({});
            });

            setTimeout(() => {
                expect(started).to.equal(3);
                done();
            }, maxTime);
        });
    });

    context('groupBySeries', () => {
        var obj = {a: 'b', b: 'c', c: 'd'};
        it('basics', (done) => {
            var running = 0;
            var concurrency = {'b': 1, 'c': 1, 'd': 1};
            async.groupBySeries(obj, (val, next) => {
                running++;
                async.setImmediate(() => {
                    expect(running).to.equal(concurrency[val]);
                    running--;
                    next(null, val);
                });
            }, (err, result) => {
                expect(running).to.equal(0);
                expect(err).to.eql(null);
                expect(result).to.eql({'b': ['b'], 'c': ['c'], 'd': ['d']});
                done();
            });
        });

        it('error', (done) => {
            async.groupBySeries(obj, (val, next) => {
                if (val === 'c') {
                    return next(new Error('fail'));
                }
                next(null, val);
            }, (err, result) => {
                expect(err).to.not.eql(null);
                expect(result).to.eql({b: ['b']});
                done();
            });
        });

        it('canceled', (done) => {
            var callOrder = [];
            async.groupBySeries([1, 2, 3], (val, next) => {
                callOrder.push(val);
                async.setImmediate(() => {
                    if (val === 2) {
                        return next(false, val+1);
                    }
                    next(null, val+1);
                });
            }, () => {
                throw new Error('should not get here');
            });

            setTimeout(() => {
                expect(callOrder).to.eql([1, 2]);
                done();
            }, 50);
        });

        it('handles arrays', (done) => {
            async.groupBySeries(['a', 'a', 'b'], (val, next) => {
                next(null, val);
            }, (err, result) => {
                expect(err).to.eql(null);
                expect(result).to.eql({'a': ['a', 'a'], 'b': ['b']});
                done();
            });
        });

        it('handles empty object', (done) => {
            async.groupBySeries({}, (val, next) => {
                assert(false, 'iteratee should not be called');
                next();
            }, (err, result) => {
                expect(err).to.eql(null);
                expect(result).to.eql({});
                done();
            });
        });

        it('handles undefined', (done) => {
            async.groupBySeries(undefined, (val, next) => {
                assert(false, 'iteratee should not be called');
                next();
            }, (err, result) => {
                expect(err).to.eql(null);
                expect(result).to.eql({});
                done();
            });
        });
    });
});
