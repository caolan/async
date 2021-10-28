var async = require('../lib');
var {expect} = require('chai');

describe('mapValues', () => {
    var obj = {a: 1, b: 2, c: 3, d: 4};

    context('mapValuesLimit', () => {
        it('basics', (done) => {
            var running = 0;
            var concurrency = {
                a: 2,
                b: 2,
                c: 2,
                d: 1
            };
            async.mapValuesLimit(obj, 2, (val, key, next) => {
                running++;
                async.setImmediate(() => {
                    expect(running).to.equal(concurrency[key]);
                    running--;
                    next(null, key + val);
                });
            }, (err, result) => {
                expect(running).to.equal(0);
                expect(err).to.eql(null);
                expect(result).to.eql({a: 'a1', b: 'b2', c: 'c3', d: 'd4'});
                done();
            });
        });

        it('error', (done) => {
            async.mapValuesLimit(obj, 1, (val, key, next) => {
                if (key === 'b') {
                    return next(new Error("fail"));
                }
                next(null, val);
            }, (err, result) => {
                expect(err).to.not.eql(null);
                expect(result).to.eql({a: 1});
                done();
            });
        });

        it('canceled', (done) => {
            var callOrder = [];
            async.mapValuesLimit(obj, 2, (val, key, next) => {
                callOrder.push(val, key);
                async.setImmediate(() => {
                    if (key === 'b') {
                        return next(false);
                    }
                    next(null, val);
                });
            }, () => {
                throw new Error('should not get here');
            });

            setTimeout(() => {
                expect(callOrder).to.eql([1, 'a', 2, 'b', 3, 'c']);
                done();
            }, 50);
        });

        it('prototype pollution', (done) => {
            var input = JSON.parse('{"a": 1, "b": 2, "__proto__": { "exploit": true }}');

            async.mapValues(input, (val, key, next) => {
                next(null, val)
            }, (err, result) => {
                expect(result.exploit).to.equal(undefined)
                done(err);
            })
        })
    });

    context('mapValues', () => {
        it('basics', (done) => {
            var running = 0;
            var concurrency = {
                a: 4,
                b: 3,
                c: 2,
                d: 1
            };
            async.mapValues(obj, (val, key, next) => {
                running++;
                async.setImmediate(() => {
                    expect(running).to.equal(concurrency[key]);
                    running--;
                    next(null, key + val);
                });
            }, (err, result) => {
                expect(running).to.equal(0);
                expect(err).to.eql(null);
                expect(result).to.eql({a: 'a1', b: 'b2', c: 'c3', d: 'd4'});
                done();
            });
        });

        it('canceled', (done) => {
            var callOrder = [];
            async.mapValues(obj, (val, key, next) => {
                callOrder.push(val, key);
                if (key === 'b') {
                    return next(false, val);
                }
                next(null, val);
            }, () => {
                throw new Error('should not get here');
            });

            setTimeout(() => {
                expect(callOrder).to.eql([1, 'a', 2, 'b']);
                done();
            }, 25);
        });
    });

    context('mapValuesSeries', () => {
        it('basics', (done) => {
            var running = 0;
            var concurrency = {
                a: 1,
                b: 1,
                c: 1,
                d: 1
            };
            async.mapValuesSeries(obj, (val, key, next) => {
                running++;
                async.setImmediate(() => {
                    expect(running).to.equal(concurrency[key]);
                    running--;
                    next(null, key + val);
                });
            }, (err, result) => {
                expect(running).to.equal(0);
                expect(err).to.eql(null);
                expect(result).to.eql({a: 'a1', b: 'b2', c: 'c3', d: 'd4'});
                done();
            });
        });

        it('canceled', (done) => {
            var callOrder = [];
            async.mapValuesSeries(obj, (val, key, next) => {
                callOrder.push(val, key);
                async.setImmediate(() => {
                    if (key === 'b') {
                        return next(false, val);
                    }
                    next(null, val);
                });
            }, () => {
                throw new Error('should not get here');
            });

            setTimeout(() => {
                expect(callOrder).to.eql([1, 'a', 2, 'b']);
                done();
            }, 50);
        });
    });
});
