var async = require('../lib');
var {expect} = require('chai');
var assert = require('assert');

describe("each", () => {

    function eachIteratee(args, x, callback) {
        setTimeout(() => {
            args.push(x);
            callback();
        }, x*25);
    }

    function eachNoCallbackIteratee(done, x, callback) {
        expect(x).to.equal(1);
        callback();
        done();
    }

    it('each', function(done) {
        var args = [];
        async.each([1,3,2], eachIteratee.bind(this, args), (err) => {
            assert(err === null, err + " passed instead of 'null'");
            expect(args).to.eql([1,2,3]);
            done();
        });
    });

    it('each extra callback', (done) => {
        var count = 0;
        async.each([1,3,2], (val, callback) => {
            count++;
            var done_ = count == 3;
            callback();
            assert.throws(callback);
            if (done_) {
                done();
            }
        });
    });

    it('each empty array', (done) => {
        async.each([], (x, callback) => {
            assert(false, 'iteratee should not be called');
            callback();
        }, (err) => {
            if (err) throw err;
            assert(true, 'should call callback');
        });
        setTimeout(done, 25);
    });


    it('each empty array, with other property on the array', (done) => {
        var myArray = [];
        myArray.myProp = "anything";
        async.each(myArray, (x, callback) => {
            assert(false, 'iteratee should not be called');
            callback();
        }, (err) => {
            if (err) throw err;
            assert(true, 'should call callback');
        });
        setTimeout(done, 25);
    });


    it('each error', (done) => {
        async.each([1,2,3], (x, callback) => {
            callback('error');
        }, (err) => {
            expect(err).to.equal('error');
        });
        setTimeout(done, 50);
    });

    it('each canceled', (done) => {
        var call_order = [];
        async.each([1, 2, 3], (x, callback) => {
            call_order.push(x);
            if (x === 2) {
                return callback(false);
            }
            callback(null);
        }, () => {
            throw new Error('should not get here');
        });

        setTimeout(() => {
            expect(call_order).to.eql([1, 2, 3]);
            done();
        }, 25);
    });

    it('each no callback', function(done) {
        async.each([1], eachNoCallbackIteratee.bind(this, done));
    });

    it('each no callback', async (done) => {
        try {
            async.each([1], 'INVALID_CALL_BACK', () => {});
        } catch(err) {
            expect(err.message).to.equal('expected a function')
            done()
        }
    });

    it('eachSeries', function(done) {
        var args = [];
        async.eachSeries([1,3,2], eachIteratee.bind(this, args), (err) => {
            assert(err === null, err + " passed instead of 'null'");
            expect(args).to.eql([1,3,2]);
            done();
        });
    });

    it('eachSeries empty array', (done) => {
        async.eachSeries([], (x, callback) => {
            assert(false, 'iteratee should not be called');
            callback();
        }, (err) => {
            if (err) throw err;
            assert(true, 'should call callback');
        });
        setTimeout(done, 25);
    });

    it('eachSeries array modification', (done) => {
        var arr = [1, 2, 3, 4];
        async.eachSeries(arr, (x, callback) => {
            async.setImmediate(callback);
        }, () => {
            assert(true, 'should call callback');
        });

        arr.pop();
        arr.splice(0, 1);

        setTimeout(done, 50);
    });

    // bug #782.  Remove in next major release
    it('eachSeries single item', (done) => {
        var sync = true;
        async.eachSeries([1], (i, cb) => {
            cb(null);
        }, () => {
            assert(sync, "callback not called on same tick");
        });
        sync = false;
        done();
    });

    // bug #782.  Remove in next major release
    it('eachSeries single item', (done) => {
        var sync = true;
        async.eachSeries([1], (i, cb) => {
            cb(null);
        }, () => {
            assert(sync, "callback not called on same tick");
        });
        sync = false;
        done();
    });

    it('eachSeries error', (done) => {
        var call_order = [];
        async.eachSeries([1,2,3], (x, callback) => {
            call_order.push(x);
            callback('error');
        }, (err) => {
            expect(call_order).to.eql([1]);
            expect(err).to.equal('error');
        });
        setTimeout(done, 50);
    });

    it('eachSeries canceled', (done) => {
        var call_order = [];
        async.eachSeries([1, 2, 3], (x, callback) => {
            call_order.push(x);
            async.setImmediate(() => {
                if (x === 2) {
                    return callback(false);
                }
                callback(null);
            });
        }, () => {
            throw new Error('should not get here');
        });

        setTimeout(() => {
            expect(call_order).to.eql([1, 2]);
            done();
        }, 50);
    });

    it('eachSeries no callback', function(done) {
        async.eachSeries([1], eachNoCallbackIteratee.bind(this, done));
    });


    it('eachLimit', (done) => {
        var args = [];
        var arr = [0,1,2,3,4,5,6,7,8,9];
        async.eachLimit(arr, 2, (x,callback) => {
            setTimeout(() => {
                args.push(x);
                callback();
            }, x*5);
        }, (err) => {
            assert(err === null, err + " passed instead of 'null'");
            expect(args).to.eql(arr);
            done();
        });
    });

    it('eachLimit empty array', (done) => {
        async.eachLimit([], 2, (x, callback) => {
            assert(false, 'iteratee should not be called');
            callback();
        }, (err) => {
            if (err) throw err;
            assert(true, 'should call callback');
        });
        setTimeout(done, 25);
    });

    it('eachLimit limit exceeds size', function(done) {
        var args = [];
        var arr = [0,1,2,3,4,5,6,7,8,9];
        async.eachLimit(arr, 20, eachIteratee.bind(this, args), (err) => {
            if (err) throw err;
            expect(args).to.eql(arr);
            done();
        });
    });

    it('eachLimit limit equal size', function(done) {
        var args = [];
        var arr = [0,1,2,3,4,5,6,7,8,9];
        async.eachLimit(arr, 10, eachIteratee.bind(this, args), (err) => {
            if (err) throw err;
            expect(args).to.eql(arr);
            done();
        });
    });

    it('eachLimit zero limit', () => {
        expect(() => {
            async.eachLimit([0,1,2,3,4,5], 0, (x, callback) => {
                assert(false, 'iteratee should not be called');
                callback();
            }, () => {
                assert(false, 'should not call callback');
            });
        }).to.throw(/limit/)
    });

    it('eachLimit error', (done) => {
        var arr = [0,1,2,3,4,5,6,7,8,9];
        var call_order = [];

        async.eachLimit(arr, 3, (x, callback) => {
            call_order.push(x);
            if (x === 2) {
                callback('error');
            }
        }, (err) => {
            expect(call_order).to.eql([0,1,2]);
            expect(err).to.equal('error');
        });
        setTimeout(done, 25);
    });

    it('eachLimit canceled', (done) => {
        var call_order = [];
        async.eachLimit([1, 1, 2, 2, 3], 2, (x, callback) => {
            call_order.push(x);
            async.setImmediate(() => {
                if (x === 2) {
                    return callback(false);
                }
                callback(null);
            });
        }, () => {
            throw new Error('should not get here');
        });

        setTimeout(() => {
            expect(call_order).to.eql([1, 1, 2, 2]);
            done();
        }, 50);
    });

    it('eachLimit no callback', function(done) {
        async.eachLimit([1], 1, eachNoCallbackIteratee.bind(this, done));
    });

    it('eachLimit synchronous', (done) => {
        var args = [];
        var arr = [0,1,2];
        async.eachLimit(arr, 5, (x,callback) => {
            args.push(x);
            callback();
        }, (err) => {
            if (err) throw err;
            expect(args).to.eql(arr);
            done();
        });
    });

    it('eachLimit does not continue replenishing after error', (done) => {
        var started = 0;
        var arr = [0,1,2,3,4,5,6,7,8,9];
        var delay = 10;
        var limit = 3;
        var maxTime = 10 * arr.length;

        async.eachLimit(arr, limit, (x, callback) => {
            started ++;
            if (started === 3) {
                return callback(new Error ("Test Error"));
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

    it('forEach alias', (done) => {
        assert.strictEqual(async.each, async.forEach);
        done();
    });

    it('forEachSeries alias', (done) => {
        assert.strictEqual(async.eachSeries, async.forEachSeries);
        done();
    });

    it('forEachLimit alias', (done) => {
        assert.strictEqual(async.eachLimit, async.forEachLimit);
        done();
    });
});
