var async = require('../lib');
var expect = require('chai').expect;

describe('mapValues', () => {
    var obj = {a: 1, b: 2, c: 3};

    context('mapValuesLimit', () => {
        it('basics', (done) => {
            var running = 0;
            var concurrency = {
                a: 2,
                b: 2,
                c: 1
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
                expect(result).to.eql({a: 'a1', b: 'b2', c: 'c3'});
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
    });

    context('mapValues', () => {
        it('basics', (done) => {
            var running = 0;
            var concurrency = {
                a: 3,
                b: 2,
                c: 1
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
                expect(result).to.eql({a: 'a1', b: 'b2', c: 'c3'});
                done();
            });
        });
    });

    context('mapValuesSeries', () => {
        it('basics', (done) => {
            var running = 0;
            var concurrency = {
                a: 1,
                b: 1,
                c: 1
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
                expect(result).to.eql({a: 'a1', b: 'b2', c: 'c3'});
                done();
            });
        });
    });
});
