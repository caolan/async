var async = require('../lib');
var expect = require('chai').expect;
var assert = require('assert');

describe('groupBy', function() {
    this.timeout(250);

    function groupByIteratee(callOrder, val, next) {
        setTimeout(function() {
            callOrder.push(val);
            next(null, val+1);
        }, val * 25);
    }

    context('groupBy', function() {
        it('basics', function(done) {
            var callOrder = [];
            async.groupBy([1, 3, 2], groupByIteratee.bind(this, callOrder), function(err, result) {
                expect(err).to.eql(null);
                expect(callOrder).to.eql([1, 2, 3]);
                expect(result).to.eql({2: [1], 3: [2], 4: [3]});
                done();
            });
        });

        it('error', function(done) {
            async.groupBy([1, 3, 2], function(val, next) {
                if (val === 3) {
                    return next(new Error('fail'));
                }
                next(null, val+1);
            }, function(err, result) {
                expect(err).to.not.eql(null);
                expect(result).to.eql({2: [1]});
                done();
            });
        });

        it('original untouched', function(done) {
            var obj = {a: 'b', b: 'c', c: 'd'};
            async.groupBy(obj, function(val, next) {
                next(null, val);
            }, function(err, result) {
                expect(obj).to.eql({a: 'b', b: 'c', c: 'd'});
                expect(result).to.eql({b: ['b'], c: ['c'], d: ['d']});
                done();
            });
        });

        it('handles multiple matches', function(done) {
            var callOrder = [];
            async.groupBy([1, 3, 2, 2], groupByIteratee.bind(this, callOrder), function(err, result) {
                expect(err).to.eql(null);
                expect(callOrder).to.eql([1, 2, 2, 3]);
                expect(result).to.eql({2: [1], 3: [2, 2], 4: [3]});
                done();
            });
        });

        it('handles objects', function(done) {
            var obj = {a: 'b', b: 'c', c: 'd'};
            var concurrency = {b: 3, c: 2, d: 1};
            var running = 0;
            async.groupBy(obj, function(val, next) {
                running++;
                async.setImmediate(function() {
                    expect(running).to.equal(concurrency[val]);
                    running--;
                    next(null, val);
                });
            }, function(err, result) {
                expect(running).to.equal(0);
                expect(err).to.eql(null);
                expect(result).to.eql({b: ['b'], c: ['c'], d: ['d']});
                done();
            });
        });

        it('handles undefined', function(done) {
            async.groupBy(undefined, function(val, next) {
                assert(false, 'iteratee should not be called');
                next();
            }, function(err, result) {
                expect(err).to.eql(null);
                expect(result).to.eql({});
                done();
            });
        });

        it('handles empty object', function(done) {
            async.groupBy({}, function(val, next) {
                assert(false, 'iteratee should not be called');
                next();
            }, function(err, result) {
                expect(err).to.eql(null);
                expect(result).to.eql({});
                done();
            });
        });

        it('main callback optional' , function(done) {
            var arr = [1, 2, 3];
            var runs = [];
            async.groupBy(arr, function(val, next) {
                runs.push(val);
                var _done = (runs.length === arr.length);
                async.setImmediate(function() {
                    next(null);
                    if (_done) {
                        expect(runs).to.eql(arr);
                        done();
                    }
                });
            });
        });

        it('iteratee callback is only called once', function(done) {
            async.groupBy([1, 2], function(item, callback) {
                try {
                    callback(item);
                } catch (exception) {
                    expect(function() {
                        callback(exception);
                    }).to.throw(/already called/);
                    done();
                }
            }, function() {
                throw new Error();
            });
        });

        it('handles Map', function(done) {
            if (typeof Map !== 'function') {
                return done();
            }

            var map = new Map([
                ['a', 'a'],
                ['b', 'b'],
                ['c', 'a']
            ]);

            async.groupBy(map, function(val, next) {
                next(null, val[1]+1);
            }, function(err, result) {
                expect(err).to.eql(null);
                expect(result).to.eql({
                    a1: [ ['a', 'a'], ['c', 'a']],
                    b1: [ ['b', 'b'] ]
                });
                done();
            });
        });

        it('handles sparse results', function(done) {
            var arr = [1, 2, 3];
            async.groupBy(arr, function(val, next) {
                if (val === 1) {
                    return next(null, val+1);
                } else if (val === 2) {
                    async.setImmediate(function() {
                        return next(null, val+1);
                    });
                } else {
                    return next('error');
                }
            }, function(err, result) {
                expect(err).to.not.eql(null);
                expect(result).to.eql({2: [1]});
                async.setImmediate(done);
            });
        });
    });

    context('groupByLimit', function() {
        var obj = {a: 'b', b: 'c', c: 'd'};
        it('basics', function(done) {
            var running = 0;
            var concurrency = {'b': 2, 'c': 2, 'd': 1};
            async.groupByLimit(obj, 2, function(val, next) {
                running++;
                async.setImmediate(function() {
                    expect(running).to.equal(concurrency[val]);
                    running--;
                    next(null, val);
                });
            }, function(err, result) {
                expect(running).to.equal(0);
                expect(err).to.eql(null);
                expect(result).to.eql({'b': ['b'], 'c': ['c'], 'd': ['d']})
                done();
            });
        });

        it('error', function(done) {
            async.groupByLimit(obj, 1, function(val, next) {
                if (val === 'c') {
                    return next(new Error('fail'));
                }
                next(null, val);
            }, function(err, result) {
                expect(err).to.not.eql(null);
                expect(result).to.eql({b: ['b']});
                done();
            });
        });

        it('handles empty object', function(done) {
            async.groupByLimit({}, 2, function(val, next) {
                assert(false, 'iteratee should not be called');
                next();
            }, function(err, result) {
                expect(err).to.eql(null);
                expect(result).to.eql({});
                done();
            });
        });

        it('handles undefined', function(done) {
            async.groupByLimit(undefined, 2, function(val, next) {
                assert(false, 'iteratee should not be called');
                next();
            }, function(err, result) {
                expect(err).to.eql(null);
                expect(result).to.eql({});
                done();
            });
        });

        it('limit exceeds size', function(done) {
            var callOrder = [];
            async.groupByLimit([3, 2, 2, 1], 10, groupByIteratee.bind(this, callOrder), function(err, result) {
                expect(err).to.eql(null);
                expect(result).to.eql({2: [1], 3: [2, 2], 4: [3]});
                expect(callOrder).to.eql([1, 2, 2, 3]);
                done();
            });
        });

        it('limit equal size', function(done) {
            var callOrder = [];
            async.groupByLimit([3, 2, 2, 1], 4, groupByIteratee.bind(this, callOrder), function(err, result) {
                expect(err).to.eql(null);
                expect(result).to.eql({2: [1], 3: [2, 2], 4: [3]});
                expect(callOrder).to.eql([1, 2, 2, 3]);
                done();
            });
        });

        it('zero limit', function(done) {
            async.groupByLimit([3, 2, 2, 1], 0, function(val, next) {
                assert(false, 'iteratee should not be called');
                next();
            }, function(err, result) {
                expect(err).to.eql(null);
                expect(result).to.eql({});
                done();
            });
        });

        it('does not continue replenishing after error', function(done) {
            var started = 0;
            var arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
            var delay = 10;
            var limit = 3;
            var maxTime = 10 * arr.length;

            async.groupByLimit(arr, limit, function(val, next) {
                started++;
                if (started === 3) {
                    return next(new Error('fail'));
                }

                setTimeout(function() {
                    next();
                }, delay);
            }, function(err, result) {
                expect(err).to.not.eql(null);
                expect(result).to.eql({});
            });

            setTimeout(function() {
                expect(started).to.equal(3);
                done();
            }, maxTime);
        });
    });

    context('groupBySeries', function() {
        var obj = {a: 'b', b: 'c', c: 'd'};
        it('basics', function(done) {
            var running = 0;
            var concurrency = {'b': 1, 'c': 1, 'd': 1};
            async.groupBySeries(obj, function(val, next) {
                running++;
                async.setImmediate(function() {
                    expect(running).to.equal(concurrency[val]);
                    running--;
                    next(null, val);
                });
            }, function(err, result) {
                expect(running).to.equal(0);
                expect(err).to.eql(null);
                expect(result).to.eql({'b': ['b'], 'c': ['c'], 'd': ['d']});
                done();
            });
        });

        it('error', function(done) {
            async.groupBySeries(obj, function(val, next) {
                if (val === 'c') {
                    return next(new Error('fail'));
                }
                next(null, val);
            }, function(err, result) {
                expect(err).to.not.eql(null);
                expect(result).to.eql({b: ['b']});
                done();
            });
        });

        it('handles arrays', function(done) {
            async.groupBySeries(['a', 'a', 'b'], function(val, next) {
                next(null, val);
            }, function(err, result) {
                expect(err).to.eql(null);
                expect(result).to.eql({'a': ['a', 'a'], 'b': ['b']});
                done();
            });
        });

        it('handles empty object', function(done) {
            async.groupByLimit({}, 2, function(val, next) {
                assert(false, 'iteratee should not be called');
                next();
            }, function(err, result) {
                expect(err).to.eql(null);
                expect(result).to.eql({});
                done();
            });
        });

        it('handles undefined', function(done) {
            async.groupBySeries(undefined, function(val, next) {
                assert(false, 'iteratee should not be called');
                next();
            }, function(err, result) {
                expect(err).to.eql(null);
                expect(result).to.eql({});
                done();
            });
        });
    });
});
