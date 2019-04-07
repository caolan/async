var async = require('../lib');
var {expect} = require('chai');

describe('timeout', () => {

    it('timeout with series', (done) => {
        async.series([
            async.timeout((callback) => {
                setTimeout(() => {
                    callback(null, 'I didn\'t time out');
                }, 25);
            }, 50),
            async.timeout((callback) => {
                setTimeout(() => {
                    callback(null, 'I will time out');
                }, 75);
            }, 50)
        ],
        (err, results) => {
            expect(err.message).to.equal('Callback function "anonymous" timed out.');
            expect(err.code).to.equal('ETIMEDOUT');
            expect(err.info).to.equal(undefined);
            expect(results[0]).to.equal('I didn\'t time out');
            done();
        });
    });

    it('timeout with series and info', (done) => {
        var info = { custom: 'info about callback' };
        async.series([
            async.timeout((callback) => {
                setTimeout(() => {
                    callback(null, 'I didn\'t time out');
                }, 25);
            }, 50),
            async.timeout((callback) => {
                setTimeout(() => {
                    callback(null, 'I will time out');
                }, 75);
            }, 50, info)
        ],
        (err, results) => {
            expect(err.message).to.equal('Callback function "anonymous" timed out.');
            expect(err.code).to.equal('ETIMEDOUT');
            expect(err.info).to.equal(info);
            expect(results[0]).to.equal('I didn\'t time out');
            done();
        });
    });

    it('timeout with parallel', (done) => {
        async.parallel([
            async.timeout((callback) => {
                setImmediate(() => {
                    callback(null, 'I didn\'t time out');
                });
            }, 20),
            async.timeout((callback) => {
                setTimeout(() => {
                    callback(null, 'I will time out');
                }, 75);
            }, 20)
        ],
        (err, results) => {
            expect(err.message).to.equal('Callback function "anonymous" timed out.');
            expect(err.code).to.equal('ETIMEDOUT');
            expect(err.info).to.equal(undefined);
            expect(results[0]).to.equal('I didn\'t time out');
            done();
        });
    });

    it('timeout with multiple calls (#1418)', (done) => {
        var timeout = async.timeout((n, callback) => {
            if (n < 1) {
                setTimeout(() => {
                    callback(null, 'I will time out');
                }, 75);
            } else {
                async.setImmediate(() => {
                    callback(null, 'I didn\'t time out');
                })
            }
        }, 20);

        async.series([
            function(cb) {
                timeout(0, (err, result) => {
                    expect(err.message).to.equal('Callback function "anonymous" timed out.');
                    expect(err.code).to.equal('ETIMEDOUT');
                    expect(err.info).to.equal(undefined);
                    expect(result).to.equal(undefined);
                    cb();
                });
            },
            function(cb) {
                timeout(1, (err, result) => {
                    expect(err).to.equal(null);
                    expect(result).to.equal('I didn\'t time out');
                    cb();
                });
            }
        ], (err) => {
            expect(err).to.equal(null);
            done();
        });
    })
});
