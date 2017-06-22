var async = require('../lib');
var expect = require('chai').expect;
var assert = require('assert');

describe('concat', function() {
    this.timeout(250);

    function concatIteratee(callOrder, val, next) {
        setTimeout(function() {
            callOrder.push(val);
            next(null, [val, val+1]);
        }, val * 25);
    }

    context('concat', function() {
        it('basics', function(done) {
            var callOrder = [];
            async.concat([1, 3, 2], concatIteratee.bind(this, callOrder), function(err, result) {
                expect(err).to.eql(null);
                expect(callOrder).to.eql([1, 2, 3]);
                expect(result).to.eql([1, 2, 3, 4, 2, 3]);
                done();
            });
        });

        it('error', function(done) {
            async.concat([1, 3, 2], function(val, next) {
                if (val === 3) {
                    return next(new Error('fail'));
                }
                next(null, [val, val+1]);
            }, function(err, result) {
                expect(err).to.not.eql(null);
                expect(result).to.eql([1, 2]);
                done();
            });
        });

        it('original untouched', function(done) {
            var arr = ['foo', 'bar', 'baz'];
            async.concat(arr, function(val, next) {
                next(null, [val, val]);
            }, function(err, result) {
                expect(arr).to.eql(['foo', 'bar', 'baz']);
                expect(result).to.eql(['foo', 'foo', 'bar', 'bar', 'baz', 'baz']);
                done();
            });
        });

        it('empty results', function(done) {
            var arr = ['foo', 'bar', 'baz'];
            async.concat(arr, function(val, next) {
                next(null);
            }, function(err, result) {
                expect(err).to.eql(null);
                expect(result).to.be.an('array').that.is.empty;
                done();
            });
        });

        it('empty arrays', function(done) {
            var arr = ['foo', 'bar', 'baz'];
            async.concat(arr, function(val, next) {
                next(null, []);
            }, function(err, result) {
                expect(err).to.eql(null);
                expect(result).to.be.an('array').that.is.empty;
                done();
            });
        });

        it('handles empty object', function(done) {
            async.concat({}, function(val, next) {
                assert(false, 'iteratee should not be called');
                next();
            }, function(err, result) {
                expect(err).to.eql(null);
                expect(result).to.be.an('array').that.is.empty;
                done();
            });
        });

        it('variadic', function(done) {
            var arr = ['foo', 'bar', 'baz'];
            async.concat(arr, function(val, next) {
                next(null, val, val);
            }, function(err, result) {
                expect(err).to.eql(null);
                expect(result).to.eql(['foo', 'foo', 'bar', 'bar', 'baz', 'baz']);
                done();
            });
        });

        it('flattens arrays', function(done) {
            var arr = ['foo', 'bar'];
            async.concat(arr, function(val, next) {
                next(null, [val, [val]]);
            }, function(err, result) {
                expect(err).to.eql(null);
                expect(result).to.eql(['foo', ['foo'], 'bar', ['bar']]);
                done();
            });
        });

        it('handles fasly values', function(done) {
            var falsy = [null, undefined, 0, ''];
            async.concat(falsy, function(val, next) {
                next(null, val);
            }, function(err, result) {
                expect(err).to.eql(null);
                expect(result).to.eql(falsy);
                done();
            });
        });

        it('handles objects', function(done) {
            var obj = {a: 'foo', b: 'bar', c: 'baz'};
            async.concat(obj, function(val, next) {
                next(null, val);
            }, function(err, result) {
                expect(err).to.eql(null);
                expect(result).to.eql(['foo', 'bar', 'baz']);
                done();
            });
        });

        it('main callback optional', function(done) {
            var arr = [1, 2, 3];
            var runs = [];
            async.concat(arr, function(val, next) {
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
            async.concat([1, 2], function(val, next) {
                try {
                    next(val);
                } catch (exception) {
                    expect(function() {
                        next(exception);
                    }).to.throw(/already called/);
                    done();
                }
            }, function() {
                throw new Error();
            });
        });

        it('preserves order', function(done) {
            var arr = [30, 15];
            async.concat(arr, function(x, cb) {
                setTimeout(function() {
                    cb(null, x);
                }, x);
            }, function(err, result) {
                expect(err).to.eql(null);
                expect(result).to.eql(arr);
                done();
            });
        });

        it('handles Map', function(done) {
            if (typeof Map !== 'function') {
                return done();
            }

            var map = new Map([
                ['a', 'b'],
                ['b', 'c'],
                ['c', 'd']
            ]);

            async.concat(map, function(val, next) {
                next(null, val);
            }, function(err, result) {
                expect(err).to.eql(null);
                expect(result).to.eql(['a', 'b', 'b', 'c', 'c', 'd']);
                done();
            });
        });

        it('handles sparse results', function(done) {
            var arr = [1, 2, 3, 4];
            async.concat(arr, function(val, next) {
                if (val === 1 || val === 3) {
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
                expect(result).to.eql([2, 4]);
                async.setImmediate(done);
            });
        });
    });

    context('concatLimit', function() {
        var arr = ['foo', 'bar', 'baz'];
        it('basics', function(done) {
            var running = 0;
            var concurrency = {'foo': 2, 'bar': 2, 'baz': 1};
            async.concatLimit(arr, 2, function(val, next) {
                running++;
                async.setImmediate(function() {
                    expect(running).to.equal(concurrency[val]);
                    running--;
                    next(null, val, val);
                })
            }, function(err, result) {
                expect(running).to.equal(0);
                expect(err).to.eql(null);
                expect(result).to.eql(['foo', 'foo', 'bar', 'bar', 'baz', 'baz']);
                done();
            });
        });

        it('error', function(done) {
            async.concatLimit(arr, 1, function(val, next) {
                if (val === 'bar') {
                    return next(new Error('fail'));
                }
                next(null, val);
            }, function(err, result) {
                expect(err).to.not.eql(null);
                expect(result).to.eql(['foo']);
                done();
            });
        });

        it('handles objects', function(done) {
            async.concatLimit({'foo': 1, 'bar': 2, 'baz': 3}, 2, function(val, next) {
                next(null, val+1);
            }, function(err, result) {
                expect(err).to.eql(null);
                expect(result).to.eql([2, 3, 4]);
                done();
            });
        });

        it('handles empty object', function(done) {
            async.concatLimit({}, 2, function(val, next) {
                assert(false, 'iteratee should not be called');
                next();
            }, function(err, result) {
                expect(err).to.eql(null);
                expect(result).to.be.an('array').that.is.empty;
                done();
            });
        });

        it('handles undefined', function(done) {
            async.concatLimit(undefined, 2, function(val, next) {
                assert(false, 'iteratee should not be called');
                next();
            }, function(err, result) {
                expect(err).to.eql(null);
                expect(result).to.be.an('array').that.is.empty;
                done();
            });
        });

        it('limit exceeds size', function(done) {
            var callOrder = [];
            async.concatLimit([3, 2, 2, 1], 10, concatIteratee.bind(this, callOrder), function(err, result) {
                expect(err).to.eql(null);
                expect(result).to.eql([3, 4, 2, 3, 2, 3, 1, 2]);
                expect(callOrder).to.eql([1, 2, 2, 3]);
                done();
            });
        });

        it('limit equal size', function(done) {
            var callOrder = [];
            async.concatLimit([3, 2, 2, 1], 4, concatIteratee.bind(this, callOrder), function(err, result) {
                expect(err).to.eql(null);
                expect(result).to.eql([3, 4, 2, 3, 2, 3, 1, 2]);
                expect(callOrder).to.eql([1, 2, 2, 3]);
                done();
            });
        });

        it('zero limit', function(done) {
            async.concatLimit([3, 2, 2, 1], 0, function(val, next) {
                assert(false, 'iteratee should not be called');
                next();
            }, function(err, result) {
                expect(err).to.eql(null);
                expect(result).to.be.an('array').that.is.empty;
                done();
            });
        });

        it('does not continue replenishing after error', function(done) {
            var started = 0;
            var arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
            var limit = 3;
            var step = 0;
            var maxSteps = arr.length;

            async.concatLimit(arr, limit, function(val, next) {
                started++;
                if (started === 3) {
                    return next(new Error('fail'));
                }

                async.setImmediate(function() {
                    next();
                });
            }, function(err, result) {
                expect(err).to.not.eql(null);
                expect(result).to.be.an('array').that.is.empty;
            });

            // wait `maxSteps` event loop cycles before calling done to ensure
            // the iteratee is not called on more items in arr.
            function waitCycle() {
                step++;
                if (step >= maxSteps) {
                    expect(started).to.equal(3);
                    done();
                    return;
                } else {
                    async.setImmediate(waitCycle);
                }
            }

            async.setImmediate(waitCycle);
        });
    });

    context('concatSeries', function() {
        it('basics', function(done) {
            var callOrder = [];
            var running = 0;
            var iteratee = function (x, cb) {
                running++;
                setTimeout(function() {
                    expect(running).to.equal(1);
                    running--;
                    callOrder.push(x);
                    var r = [];
                    while (x > 0) {
                        r.push(x);
                        x--;
                    }
                    cb(null, r);
                }, x*25);
            };
            async.concatSeries([1,3,2], iteratee, function(err, results) {
                expect(results).to.eql([1,3,2,1,2,1]);
                expect(running).to.equal(0);
                expect(callOrder).to.eql([1,3,2]);
                assert(err === null, err + " passed instead of 'null'");
                done();
            });
        });

        it('error', function(done) {
            async.concatSeries(['foo', 'bar', 'baz'], function(val, next) {
                if (val === 'bar') {
                    return next(new Error('fail'));
                }
                next(null, [val, val]);
            }, function(err, result) {
                expect(err).to.not.eql(null);
                expect(result).to.eql(['foo', 'foo']);
                done();
            });
        });

        it('handles objects', function(done) {
            async.concatSeries({'foo': 1, 'bar': 2, 'baz': 3}, function(val, next) {
                return next(null, [val, val+1]);
            }, function(err, result) {
                expect(err).to.eql(null);
                expect(result).to.eql([1, 2, 2, 3, 3, 4]);
                done();
            });
        });

        it('handles empty object', function(done) {
            async.concatSeries({}, function(val, next) {
                assert(false, 'iteratee should not be called');
                next();
            }, function(err, result) {
                expect(err).to.eql(null);
                expect(result).to.be.an('array').that.is.empty;
                done();
            });
        });

        it('handles undefined', function(done) {
            async.concatSeries(undefined, function(val, next) {
                assert(false, 'iteratee should not be called');
                next();
            }, function(err, result) {
                expect(err).to.eql(null);
                expect(result).to.be.an('array').that.is.empty;
                done();
            });
        });
    });
});
