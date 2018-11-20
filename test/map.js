var async = require('../lib');
var {expect} = require('chai');
var assert = require('assert');

describe("map", () => {

    function mapIteratee(call_order, x, callback) {
        setTimeout(() => {
            call_order.push(x);
            callback(null, x * 2);
        }, x * 25);
    }

    it('basic', function(done) {
        var call_order = [];
        async.map([1, 3, 2], mapIteratee.bind(this, call_order), (err, results) => {
            assert(err === null, err + " passed instead of 'null'");
            expect(call_order).to.eql([1, 2, 3]);
            expect(results).to.eql([2, 6, 4]);
            done();
        });
    });

    it('with reflect', (done) => {
        var call_order = [];
        async.map([1, 3, 2], async.reflect((item, cb) => {
            setTimeout(() => {
                call_order.push(item);
                cb(null, item * 2);
            }, item * 25);
        }), (err, results) => {
            assert(err === null, err + " passed instead of 'null'");
            expect(call_order).to.eql([1, 2, 3]);
            expect(results).to.eql([{
                value: 2
            }, {
                value: 6
            }, {
                value: 4
            }]);
            done();
        });
    });

    it('error with reflect', (done) => {
        var call_order = [];
        async.map([-1, 1, 3, 2], async.reflect((item, cb) => {
            setTimeout(() => {
                call_order.push(item);
                if (item < 0) {
                    cb('number less then zero');
                } else {
                    cb(null, item * 2);
                }
            }, item * 25);
        }), (err, results) => {
            assert(err === null, err + " passed instead of 'null'");
            expect(call_order).to.eql([-1, 1, 2, 3]);
            expect(results).to.eql([{
                error: 'number less then zero'
            }, {
                value: 2
            }, {
                value: 6
            }, {
                value: 4
            }]);
            done();
        });
    });

    it('map original untouched', (done) => {
        var a = [1, 2, 3];
        async.map(a, (x, callback) => {
            callback(null, x * 2);
        }, (err, results) => {
            expect(results).to.eql([2, 4, 6]);
            expect(a).to.eql([1, 2, 3]);
            done();
        });
    });

    it('map without main callback', (done) => {
        var a = [1, 2, 3];
        var r = [];
        async.map(a, (x, callback) => {
            r.push(x);
            var done_ = r.length == a.length;
            callback(null);
            if (done_) {
                expect(r).to.eql(a);
                done();
            }
        });
    });

    it('map error', (done) => {
        async.map([1, 2, 3], (x, callback) => {
            callback('error');
        }, (err) => {
            expect(err).to.equal('error');
        });
        setTimeout(done, 50);
    });

    it('map canceled', (done) => {
        var call_order = [];
        async.map([1, 2, 3], (x, callback) => {
            call_order.push(x);
            if (x === 2) {
                return callback(false, x * 2);
            }
            callback(null, x * 2);
        }, () => {
            throw new Error('should not get here');
        });
        setTimeout(() => {
            expect(call_order).to.eql([1, 2, 3]);
            done();
        }, 25);
    });

    it('map undefined array', (done) => {
        async.map(undefined, (x, callback) => {
            callback();
        }, (err, result) => {
            expect(err).to.equal(null);
            expect(result).to.eql([]);
        });
        setTimeout(done, 50);
    });

    it('map object', (done) => {
        async.map({
            a: 1,
            b: 2,
            c: 3
        }, (val, callback) => {
            callback(null, val * 2);
        }, (err, result) => {
            if (err) throw err;
            expect(Array.isArray(result)).to.equal(true);
            expect(result).to.contain(2);
            expect(result).to.contain(4);
            expect(result).to.contain(6);
            done();
        });
    });

    it('mapSeries', function(done) {
        var call_order = [];
        async.mapSeries([1, 3, 2], mapIteratee.bind(this, call_order), (err, results) => {
            assert(err === null, err + " passed instead of 'null'");
            expect(call_order).to.eql([1, 3, 2]);
            expect(results).to.eql([2, 6, 4]);
            done();
        });
    });

    it('mapSeries error', (done) => {
        async.mapSeries([1, 2, 3], (x, callback) => {
            callback('error');
        }, (err) => {
            expect(err).to.equal('error');
        });
        setTimeout(done, 50);
    });

    it('mapSeries canceled', (done) => {
        var call_order = [];
        async.mapSeries([1, 2, 3], (x, callback) => {
            call_order.push(x);
            async.setImmediate(() => {
                if (x === 2) {
                    return callback(false, x * 2);
                }
                callback(null, x * 2);
            });
        }, () => {
            throw new Error('should not get here');
        });
        setTimeout(() => {
            expect(call_order).to.eql([1, 2]);
            done();
        }, 50);
    });

    it('mapSeries undefined array', (done) => {
        async.mapSeries(undefined, (x, callback) => {
            callback();
        }, (err, result) => {
            expect(err).to.equal(null);
            expect(result).to.eql([]);
        });
        setTimeout(done, 50);
    });

    it('mapSeries object', (done) => {
        async.mapSeries({
            a: 1,
            b: 2,
            c: 3
        }, (val, callback) => {
            callback(null, val * 2);
        }, (err, result) => {
            if (err) throw err;
            expect(result).to.contain(2);
            expect(result).to.contain(4);
            expect(result).to.contain(6);
            done();
        });
    });

    it('mapLimit', function(done) {
        var call_order = [];
        async.mapLimit([2, 4, 3], 2, mapIteratee.bind(this, call_order), (err, results) => {
            assert(err === null, err + " passed instead of 'null'");
            expect(call_order).to.eql([2, 4, 3]);
            expect(results).to.eql([4, 8, 6]);
            done();
        });
    });

    it('mapLimit empty array', (done) => {
        async.mapLimit([], 2, (x, callback) => {
            assert(false, 'iteratee should not be called');
            callback();
        }, (err) => {
            if (err) throw err;
            assert(true, 'should call callback');
        });
        setTimeout(done, 25);
    });

    it('mapLimit undefined array', (done) => {
        async.mapLimit(undefined, 2, (x, callback) => {
            callback();
        }, (err, result) => {
            expect(err).to.equal(null);
            expect(result).to.eql([]);
        });
        setTimeout(done, 50);
    });

    it('mapLimit limit exceeds size', function(done) {
        var call_order = [];
        async.mapLimit([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 20, mapIteratee.bind(this, call_order), (err, results) => {
            expect(call_order).to.eql([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
            expect(results).to.eql([0, 2, 4, 6, 8, 10, 12, 14, 16, 18]);
            done();
        });
    });

    it('mapLimit limit equal size', function(done) {
        var call_order = [];
        async.mapLimit([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 10, mapIteratee.bind(this, call_order), (err, results) => {
            expect(call_order).to.eql([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
            expect(results).to.eql([0, 2, 4, 6, 8, 10, 12, 14, 16, 18]);
            done();
        });
    });

    it('mapLimit zero limit', () => {
        expect(() => {
            async.mapLimit([0, 1, 2, 3, 4, 5], 0, (x, callback) => {
                assert(false, 'iteratee should not be called');
                callback();
            }, () => {
                assert(false, 'should not be called');
            });
        }).to.throw(/concurrency limit/)
    });

    it('mapLimit error', (done) => {
        var arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        var call_order = [];

        async.mapLimit(arr, 3, (x, callback) => {
            call_order.push(x);
            if (x === 2) {
                callback('error');
            }
        }, (err) => {
            expect(call_order).to.eql([0, 1, 2]);
            expect(err).to.equal('error');
        });
        setTimeout(done, 25);
    });

    it('mapLimit canceled', (done) => {
        var call_order = [];
        async.mapLimit([1, 2, 3, 4, 5], 2, (x, callback) => {
            call_order.push(x);
            async.setImmediate(() => {
                if (x === 3) {
                    return callback(false, x * 2);
                }
                callback(null, x * 2);
            });
        }, () => {
            throw new Error('should not get here');
        });
        setTimeout(() => {
            expect(call_order).to.eql([1, 2, 3, 4]);
            done();
        }, 50);
    });

    it('mapLimit does not continue replenishing after error', (done) => {
        var started = 0;
        var arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        var delay = 10;
        var limit = 3;
        var maxTime = 10 * arr.length;

        async.mapLimit(arr, limit, (x, callback) => {
            started++;
            if (started === 3) {
                return callback(new Error("Test Error"));
            }
            setTimeout(() => {
                callback();
            }, delay);
        }, () => {});

        setTimeout(() => {
            expect(started).to.equal(3);
            done();
        }, maxTime);
    });

    it('map with Map', (done) => {
        if (typeof Map !== 'function')
            return done();

        var map = new Map();
        map.set(1, "a");
        map.set(2, "b");
        async.map(map, (val, cb) => {
            cb(null, val);
        }, (err, result) => {
            assert(Array.isArray(result), "map should return an array for an iterable");
            done();
        });
    });

    // Issue 1106 on github: https://github.com/caolan/async/issues/1106
    it('map main callback is called only once', (done) => {
        async.map([1, 2], (item, callback) => {
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
});
