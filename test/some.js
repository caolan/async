var async = require('../lib');
var {expect} = require('chai');
var _ = require('lodash');

describe("some", () => {

    it('some true', (done) => {
        async.some([3,1,2], (x, callback) => {
            setTimeout(() => {callback(null, x === 1);}, 0);
        }, (err, result) => {
            expect(err).to.equal(null);
            expect(result).to.equal(true);
            done();
        });
    });

    it('some false', (done) => {
        async.some([3,1,2], (x, callback) => {
            setTimeout(() => {callback(null, x === 10);}, 0);
        }, (err, result) => {
            expect(err).to.equal(null);
            expect(result).to.equal(false);
            done();
        });
    });

    it('some early return', (done) => {
        var call_order = [];
        async.some([1,2,3], (x, callback) => {
            setTimeout(() => {
                call_order.push(x);
                callback(null, x === 1);
            }, x*5);
        }, () => {
            call_order.push('callback');
        });
        setTimeout(() => {
            expect(call_order).to.eql([1,'callback',2,3]);
            done();
        }, 25);
    });

    it('some error', (done) => {
        async.some([3,1,2], (x, callback) => {
            setTimeout(() => {callback('error');}, 0);
        }, (err, result) => {
            expect(err).to.equal('error');
            expect(result).to.not.exist;
            done();
        });
    });

    it('some canceled', (done) => {
        var call_order = [];
        async.some([3,1,2], (x, callback) => {
            call_order.push(x);
            if (x === 1) {
                return callback(false);
            }
            callback();
        }, () => {
            throw new Error('should not get here');
        });

        setTimeout(() => {
            expect(call_order).to.eql([3, 1, 2]);
            done();
        }, 25);
    });

    it('some no callback', (done) => {
        var calls = [];

        async.some([1, 2, 3], (val, cb) => {
            calls.push(val);
            cb();
        });

        setTimeout(() => {
            expect(calls).to.eql([1, 2, 3]);
            done();
        }, 10);
    });

    it('someLimit true', (done) => {
        async.someLimit([3,1,2], 2, (x, callback) => {
            setTimeout(() => {callback(null, x === 2);}, 0);
        }, (err, result) => {
            expect(err).to.equal(null);
            expect(result).to.equal(true);
            done();
        });
    });

    it('someLimit false', (done) => {
        async.someLimit([3,1,2], 2, (x, callback) => {
            setTimeout(() => {callback(null, x === 10);}, 0);
        }, (err, result) => {
            expect(err).to.equal(null);
            expect(result).to.equal(false);
            done();
        });
    });

    it('someLimit canceled', (done) => {
        var call_order = [];
        async.someLimit([1,1,2,2,3], 2, (x, callback) => {
            call_order.push(x);
            async.setImmediate(() => {
                if (x === 2) {
                    return callback(false);
                }
                callback();
            });
        }, () => {
            throw new Error('should not get here');
        });

        setTimeout(() => {
            expect(call_order).to.eql([1, 1, 2, 2,]);
            done();
        }, 50);
    });

    it('someSeries canceled', (done) => {
        var call_order = [];
        async.someSeries([1, 2, 3], (x, callback) => {
            call_order.push(x);
            async.setImmediate(() => {
                if (x === 2) {
                    return callback(false);
                }
                callback();
            });
        }, () => {
            throw new Error('should not get here');
        });

        setTimeout(() => {
            expect(call_order).to.eql([1, 2]);
            done();
        }, 50);
    });

    it('someLimit short-circuit', (done) => {
        var calls = 0;
        async.someLimit([3,1,2], 1, (x, callback) => {
            calls++;
            callback(null, x === 1);
        }, (err, result) => {
            expect(err).to.equal(null);
            expect(result).to.equal(true);
            expect(calls).to.equal(2);
            done();
        });
    });


    it('someSeries doesn\'t cause stack overflow (#1293)', (done) => {
        var arr = _.range(10000);
        let calls = 0;
        async.someSeries(arr, (data, cb) => {
            calls += 1;
            async.setImmediate(_.partial(cb, null, true));
        }, (err) => {
            expect(err).to.equal(null);
            expect(calls).to.equal(1);
            done();
        });
    });

    it('someLimit doesn\'t cause stack overflow (#1293)', (done) => {
        var arr = _.range(10000);
        let calls = 0;
        async.someLimit(arr, 100, (data, cb) => {
            calls += 1;
            async.setImmediate(_.partial(cb, null, true));
        }, (err) => {
            expect(err).to.equal(null);
            expect(calls).to.equal(100);
            done();
        });
    });

    it('any alias', () => {
        expect(async.any).to.equal(async.some);
    });

    it('anyLimit alias', () => {
        expect(async.anyLimit).to.equal(async.someLimit);
    });

    it('anySeries alias', () => {
        expect(async.anySeries).to.be.a('function');
        expect(async.anySeries).to.equal(async.someSeries);
    });


});
