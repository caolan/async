var async = require('../lib');
var {expect} = require('chai');

function filterIteratee(x, callback) {
    setTimeout(() => {
        callback(null, x % 2);
    }, x*5);
}

function testLimit(arr, limitFunc, limit, iter, done) {
    var args = [];

    limitFunc(arr, limit, (x, next) => {
        args.push(x);
        iter(x, next);
    }, (err, result) => {
        expect(args).to.eql(arr);
        done(err, result);
    });
}

describe("filter", () => {

    it('filter', (done) => {
        async.filter([3,1,2], filterIteratee, (err, results) => {
            expect(err).to.equal(null);
            expect(results).to.eql([3,1]);
            done();
        });
    });

    it('filter original untouched', (done) => {
        var a = [3,1,2];
        async.filter(a, (x, callback) => {
            callback(null, x % 2);
        }, (err, results) => {
            expect(err).to.equal(null);
            expect(results).to.eql([3,1]);
            expect(a).to.eql([3,1,2]);
            done();
        });
    });

    it('filter collection', (done) => {
        var a = {a: 3, b: 1, c: 2};
        async.filter(a, (x, callback) => {
            callback(null, x % 2);
        }, (err, results) => {
            expect(err).to.equal(null);
            expect(results).to.eql([3,1]);
            expect(a).to.eql({a: 3, b: 1, c: 2});
            done();
        });
    });

    function makeIterator(array){
        var nextIndex;
        let iterator = {
            next(){
                return nextIndex < array.length ?
                    {value: array[nextIndex++], done: false} :
                    {done: true};
            }
        };
        iterator[Symbol.iterator] = function() {
            nextIndex = 0; // reset iterator
            return iterator;
        };
        return iterator;
    }

    it('filter iterator', (done) => {
        var a = makeIterator([500, 20, 100]);
        async.filter(a, (x, callback) => {
            setTimeout(() => {
                callback(null, x > 20);
            }, x);
        }, (err, results) => {
            expect(err).to.equal(null);
            expect(results).to.eql([500, 100]);
            done();
        });
    });

    it('filter error', (done) => {
        async.filter([3,1,2], (x, callback) => {
            callback('error');
        } , (err, results) => {
            expect(err).to.equal('error');
            expect(results).to.not.exist;
            done();
        });
    });

    it('filter canceled', (done) => {
        var call_order = [];
        async.filter([3,1,2], (x, callback) => {
            call_order.push(x);
            if (x === 1) {
                return callback(false, true);
            }
            callback(null, true);
        } , () => {
            throw new Error('should not get here');
        });

        setTimeout(() => {
            expect(call_order).to.eql([3,1,2]);
            done();
        }, 25);
    });

    it('filterSeries', (done) => {
        async.filterSeries([3,1,2], filterIteratee, (err, results) => {
            expect(err).to.equal(null);
            expect(results).to.eql([3,1]);
            done();
        });
    });

    it('filterSeries canceled', (done) => {
        var call_order = [];
        async.filterSeries([3,1,2], (x, callback) => {
            call_order.push(x);
            async.setImmediate(() => {
                if (x === 1) {
                    return callback(false, true);
                }
                callback(null, true);
            });
        }, () => {
            throw new Error('should not get here');
        });

        setTimeout(() => {
            expect(call_order).to.eql([3,1]);
            done();
        }, 50);
    });

    it('select alias', () => {
        expect(async.select).to.equal(async.filter);
    });

    it('selectSeries alias', () => {
        expect(async.selectSeries).to.equal(async.filterSeries);
    });

    it('filterLimit', (done) => {
        testLimit([5, 4, 3, 2, 1], async.filterLimit, 2, (v, next) => {
            next(null, v % 2);
        }, (err, result) => {
            expect(err).to.equal(null);
            expect(result).to.eql([5, 3, 1]);
            done();
        });
    });

    it('filterLimit canceled', (done) => {
        var call_order = [];
        async.filterLimit([1,1,2,2,3], 2, (x, callback) => {
            call_order.push(x);
            async.setImmediate(() => {
                if (x === 2) {
                    return callback(false, true);
                }
                callback(null, true);
            });
        }, () => {
            throw new Error('should not get here');
        });

        setTimeout(() => {
            expect(call_order).to.eql([1,1,2,2]);
            done();
        }, 50);
    });

});

describe("reject", () => {

    it('reject', (done) => {
        async.reject([3,1,2], filterIteratee, (err, results) => {
            expect(err).to.equal(null);
            expect(results).to.eql([2]);
            done();
        });
    });

    it('reject original untouched', (done) => {
        var a = [3,1,2];
        async.reject(a, (x, callback) => {
            callback(null, x % 2);
        }, (err, results) => {
            expect(err).to.equal(null);
            expect(results).to.eql([2]);
            expect(a).to.eql([3,1,2]);
            done();
        });
    });

    it('reject error', (done) => {
        async.reject([3,1,2], (x, callback) => {
            callback('error');
        } , (err, results) => {
            expect(err).to.equal('error');
            expect(results).to.not.exist;
            done();
        });
    });

    it('reject canceled', (done) => {
        var call_order = [];
        async.filter([3,1,2], (x, callback) => {
            call_order.push(x);
            if (x === 2) {
                return callback(false, false);
            }
            callback(null, false);
        } , () => {
            throw new Error('should not get here');
        });

        setTimeout(() => {
            expect(call_order).to.eql([3,1,2]);
            done();
        }, 25);
    });

    it('rejectSeries', (done) => {
        async.rejectSeries([3,1,2], filterIteratee, (err, results) => {
            expect(err).to.equal(null);
            expect(results).to.eql([2]);
            done();
        });
    });

    it('rejectSeries canceled', (done) => {
        var call_order = [];
        async.rejectSeries([3,1,2], (x, callback) => {
            call_order.push(x);
            async.setImmediate(() => {
                if (x === 1) {
                    return callback(false, false);
                }
                callback(null, false);
            });
        }, () => {
            throw new Error('should not get here');
        });

        setTimeout(() => {
            expect(call_order).to.eql([3,1]);
            done();
        }, 50);
    });

    it('rejectLimit', (done) => {
        testLimit([5, 4, 3, 2, 1], async.rejectLimit, 2, (v, next) => {
            next(null, v % 2);
        }, (err, result) => {
            expect(err).to.equal(null);
            expect(result).to.eql([4, 2]);
            done();
        });
    });

    it('rejectLimit canceled', (done) => {
        var call_order = [];
        async.filterLimit([1,1,2,2,3], 2, (x, callback) => {
            call_order.push(x);
            async.setImmediate(() => {
                if (x === 2) {
                    return callback(false, false);
                }
                callback(null, false);
            });
        }, () => {
            throw new Error('should not get here');
        });

        setTimeout(() => {
            expect(call_order).to.eql([1,1,2,2]);
            done();
        }, 50);
    });

    it('filter fails', (done) => {
        async.filter({a: 1, b: 2, c: 3}, (item, callback) => {
            if (item === 3) {
                callback("error", false);
            } else {
                callback(null, true);
            }
        }, (err, res) => {
            expect(err).to.equal("error");
            expect(res).to.equal(undefined);
            done();
        })
    });
});
