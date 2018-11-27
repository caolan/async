var async = require('../lib');
var {expect} = require('chai');
var _ = require('lodash');

describe("every", () => {

    it('everyLimit true', (done) => {
        async.everyLimit([3,1,2], 1, (x, callback) => {
            setTimeout(() => {callback(null, x >= 1);}, 0);
        }, (err, result) => {
            expect(err).to.equal(null);
            expect(result).to.equal(true);
            done();
        });
    });

    it('everyLimit false', (done) => {
        async.everyLimit([3,1,2], 2, (x, callback) => {
            setTimeout(() => {callback(null, x === 2);}, 0);
        }, (err, result) => {
            expect(err).to.equal(null);
            expect(result).to.equal(false);
            done();
        });
    });

    it('everyLimit short-circuit', (done) => {
        var calls = 0;
        async.everyLimit([3,1,2], 1, (x, callback) => {
            calls++;
            callback(null, x === 1);
        }, (err, result) => {
            expect(err).to.equal(null);
            expect(result).to.equal(false);
            expect(calls).to.equal(1);
            done();
        });
    });


    it('true', (done) => {
        async.every([1,2,3], (x, callback) => {
            setTimeout(() => {callback(null, true);}, 0);
        }, (err, result) => {
            expect(err).to.equal(null);
            expect(result).to.equal(true);
            done();
        });
    });

    it('false', (done) => {
        async.every([1,2,3], (x, callback) => {
            setTimeout(() => {callback(null, x % 2);}, 0);
        }, (err, result) => {
            expect(err).to.equal(null);
            expect(result).to.equal(false);
            done();
        });
    });

    it('early return', (done) => {
        var call_order = [];
        async.every([1,2,3], (x, callback) => {
            setTimeout(() => {
                call_order.push(x);
                callback(null, x === 1);
            }, x*5);
        }, () => {
            call_order.push('callback');
        });
        setTimeout(() => {
            expect(call_order).to.eql([1,2,'callback',3]);
            done();
        }, 25);
    });

    it('error', (done) => {
        async.every([1,2,3], (x, callback) => {
            setTimeout(() => {callback('error');}, 0);
        }, (err, result) => {
            expect(err).to.equal('error');
            expect(result).to.not.exist;
            done();
        });
    });

    it('canceled', (done) => {
        var call_order = [];
        async.every([1,2,3], (x, callback) => {
            call_order.push(x);
            if (x === 2) {
                return callback(false, true);
            }
            callback(null, true);
        }, () => {
            throw new Error('should not get here');
        });
        setTimeout(() => {
            expect(call_order).to.eql([1,2,3]);
            done();
        }, 25);
    });

    it('everySeries doesn\'t cause stack overflow (#1293)', (done) => {
        var arr = _.range(10000);
        let calls = 0;
        async.everySeries(arr, (data, cb) => {
            calls += 1;
            async.setImmediate(_.partial(cb, null, false));
        }, (err) => {
            expect(err).to.equal(null);
            expect(calls).to.equal(1);
            done();
        });
    });

    it('everySeries canceled', (done) => {
        var call_order = [];
        async.everySeries([1,2,3], (x, callback) => {
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
            expect(call_order).to.eql([1, 2]);
            done();
        }, 50);
    });

    it('everyLimit doesn\'t cause stack overflow (#1293)', (done) => {
        var arr = _.range(10000);
        let calls = 0;
        async.everyLimit(arr, 100, (data, cb) => {
            calls += 1;
            async.setImmediate(_.partial(cb, null, false));
        }, (err) => {
            expect(err).to.equal(null);
            expect(calls).to.equal(100);
            done();
        });
    });

    it('everyLimit canceled', (done) => {
        var call_order = [];
        async.everyLimit([1,1,2,2,3], 2, (x, callback) => {
            call_order.push(x);
            async.setImmediate(() => {
                if (x === 2) {
                    return callback(false, true);
                }
                callback(null, true);
            });
        }, () => {
            throw new Error('final callback - should not get here');
        });
        setTimeout(() => {
            expect(call_order).to.eql([1,1,2,2]);
            done();
        }, 50);
    });

    it('all alias', () => {
        expect(async.all).to.equal(async.every);
    });

    it('allLimit alias', () => {
        expect(async.allLimit).to.equal(async.everyLimit);
    });

    it('allSeries alias', () => {
        expect(async.allSeries).to.be.a('function');
        expect(async.allSeries).to.equal(async.everySeries);
    });

});
