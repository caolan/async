var async = require('../lib');
var expect = require('chai').expect;
var assert = require('assert');

describe("map", function() {

    function mapIteratee(call_order, x, callback) {
        setTimeout(function() {
            call_order.push(x);
            callback(null, x * 2);
        }, x * 25);
    }

    it('basic', function(done) {
        var call_order = [];
        async.map([1, 3, 2], mapIteratee.bind(this, call_order), function(err, results) {
            assert(err === null, err + " passed instead of 'null'");
            expect(call_order).to.eql([1, 2, 3]);
            expect(results).to.eql([2, 6, 4]);
            done();
        });
    });

    it('with reflect', function(done) {
        var call_order = [];
        async.map([1, 3, 2], async.reflect(function(item, cb) {
            setTimeout(function() {
                call_order.push(item);
                cb(null, item * 2);
            }, item * 25);
        }), function(err, results) {
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

    it('error with reflect', function(done) {
        var call_order = [];
        async.map([-1, 1, 3, 2], async.reflect(function(item, cb) {
            setTimeout(function() {
                call_order.push(item);
                if (item < 0) {
                    cb('number less then zero');
                } else {
                    cb(null, item * 2);
                }
            }, item * 25);
        }), function(err, results) {
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

    it('map original untouched', function(done) {
        var a = [1, 2, 3];
        async.map(a, function(x, callback) {
            callback(null, x * 2);
        }, function(err, results) {
            expect(results).to.eql([2, 4, 6]);
            expect(a).to.eql([1, 2, 3]);
            done();
        });
    });

    it('map without main callback', function(done) {
        var a = [1, 2, 3];
        var r = [];
        async.map(a, function(x, callback) {
            r.push(x);
            var done_ = r.length == a.length;
            callback(null);
            if (done_) {
                expect(r).to.eql(a);
                done();
            }
        });
    });

    it('map error', function(done) {
        async.map([1, 2, 3], function(x, callback) {
            callback('error');
        }, function(err) {
            expect(err).to.equal('error');
        });
        setTimeout(done, 50);
    });

    it('map undefined array', function(done) {
        async.map(undefined, function(x, callback) {
            callback();
        }, function(err, result) {
            expect(err).to.equal(null);
            expect(result).to.eql([]);
        });
        setTimeout(done, 50);
    });

    it('map object', function(done) {
        async.map({
            a: 1,
            b: 2,
            c: 3
        }, function(val, callback) {
            callback(null, val * 2);
        }, function(err, result) {
            if (err) throw err;
            expect(Object.prototype.toString.call(result)).to.equal('[object Array]');
            expect(result).to.contain(2);
            expect(result).to.contain(4);
            expect(result).to.contain(6);
            done();
        });
    });

    it('mapSeries', function(done) {
        var call_order = [];
        async.mapSeries([1, 3, 2], mapIteratee.bind(this, call_order), function(err, results) {
            assert(err === null, err + " passed instead of 'null'");
            expect(call_order).to.eql([1, 3, 2]);
            expect(results).to.eql([2, 6, 4]);
            done();
        });
    });

    it('mapSeries error', function(done) {
        async.mapSeries([1, 2, 3], function(x, callback) {
            callback('error');
        }, function(err) {
            expect(err).to.equal('error');
        });
        setTimeout(done, 50);
    });

    it('mapSeries undefined array', function(done) {
        async.mapSeries(undefined, function(x, callback) {
            callback();
        }, function(err, result) {
            expect(err).to.equal(null);
            expect(result).to.eql([]);
        });
        setTimeout(done, 50);
    });

    it('mapSeries object', function(done) {
        async.mapSeries({
            a: 1,
            b: 2,
            c: 3
        }, function(val, callback) {
            callback(null, val * 2);
        }, function(err, result) {
            if (err) throw err;
            expect(result).to.contain(2);
            expect(result).to.contain(4);
            expect(result).to.contain(6);
            done();
        });
    });

    it('mapLimit', function(done) {
        var call_order = [];
        async.mapLimit([2, 4, 3], 2, mapIteratee.bind(this, call_order), function(err, results) {
            assert(err === null, err + " passed instead of 'null'");
            expect(call_order).to.eql([2, 4, 3]);
            expect(results).to.eql([4, 8, 6]);
            done();
        });
    });

    it('mapLimit empty array', function(done) {
        async.mapLimit([], 2, function(x, callback) {
            assert(false, 'iteratee should not be called');
            callback();
        }, function(err) {
            if (err) throw err;
            assert(true, 'should call callback');
        });
        setTimeout(done, 25);
    });

    it('mapLimit undefined array', function(done) {
        async.mapLimit(undefined, 2, function(x, callback) {
            callback();
        }, function(err, result) {
            expect(err).to.equal(null);
            expect(result).to.eql([]);
        });
        setTimeout(done, 50);
    });

    it('mapLimit limit exceeds size', function(done) {
        var call_order = [];
        async.mapLimit([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 20, mapIteratee.bind(this, call_order), function(err, results) {
            expect(call_order).to.eql([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
            expect(results).to.eql([0, 2, 4, 6, 8, 10, 12, 14, 16, 18]);
            done();
        });
    });

    it('mapLimit limit equal size', function(done) {
        var call_order = [];
        async.mapLimit([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 10, mapIteratee.bind(this, call_order), function(err, results) {
            expect(call_order).to.eql([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
            expect(results).to.eql([0, 2, 4, 6, 8, 10, 12, 14, 16, 18]);
            done();
        });
    });

    it('mapLimit zero limit', function(done) {
        async.mapLimit([0, 1, 2, 3, 4, 5], 0, function(x, callback) {
            assert(false, 'iteratee should not be called');
            callback();
        }, function(err, results) {
            expect(results).to.eql([]);
            assert(true, 'should call callback');
        });
        setTimeout(done, 25);
    });

    it('mapLimit error', function(done) {
        var arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        var call_order = [];

        async.mapLimit(arr, 3, function(x, callback) {
            call_order.push(x);
            if (x === 2) {
                callback('error');
            }
        }, function(err) {
            expect(call_order).to.eql([0, 1, 2]);
            expect(err).to.equal('error');
        });
        setTimeout(done, 25);
    });

    it('mapLimit does not continue replenishing after error', function(done) {
        var started = 0;
        var arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        var delay = 10;
        var limit = 3;
        var maxTime = 10 * arr.length;

        async.mapLimit(arr, limit, function(x, callback) {
            started++;
            if (started === 3) {
                return callback(new Error("Test Error"));
            }
            setTimeout(function() {
                callback();
            }, delay);
        }, function() {});

        setTimeout(function() {
            expect(started).to.equal(3);
            done();
        }, maxTime);
    });

    it('map with Map', function(done) {
        if (typeof Map !== 'function')
            return done();

        var map = new Map();
        map.set(1, "a");
        map.set(2, "b");
        async.map(map, function(val, cb) {
            cb(null, val);
        }, function(err, result) {
            assert(Array.isArray(result), "map should return an array for an iterable");
            done();
        });
    });

    // Issue 1106 on github: https://github.com/caolan/async/issues/1106
    it('map main callback is called only once', function(done) {
        async.map([1, 2], function(item, callback) {
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
});
