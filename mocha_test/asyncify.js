var async = require('../lib');
var assert = require('assert');
var expect = require('chai').expect;

describe('asyncify', function(){

    it('asyncify', function(done) {
        var parse = async.asyncify(JSON.parse);
        parse("{\"a\":1}", function (err, result) {
            assert(!err);
            expect(result.a).to.equal(1);
            done();
        });
    });

    it('asyncify null', function(done) {
        var parse = async.asyncify(function() {
            return null;
        });
        parse("{\"a\":1}", function (err, result) {
            assert(!err);
            expect(result).to.equal(null);
            done();
        });
    });

    it('variable numbers of arguments', function(done) {
        async.asyncify(function (/*x, y, z*/) {
            return arguments;
        })(1, 2, 3, function (err, result) {
            expect(result.length).to.equal(3);
            expect(result[0]).to.equal(1);
            expect(result[1]).to.equal(2);
            expect(result[2]).to.equal(3);
            done();
        });
    });

    it('catch errors', function(done) {
        async.asyncify(function () {
            throw new Error("foo");
        })(function (err) {
            assert(err);
            expect(err.message).to.equal("foo");
            done();
        });
    });

    it('dont catch errors in the callback', function(done) {
        try {
            async.asyncify(function () {})(function (err) {
                if (err) {
                    return done(new Error("should not get an error here"));
                }
                throw new Error("callback error");
            });
        } catch (err) {
            expect(err.message).to.equal("callback error");
            done();
        }
    });

    describe('promisified', function() {
        function promisifiedTests(Promise) {
            it('resolve', function(done) {
                var promisified = function(argument) {
                    return new Promise(function (resolve) {
                        setTimeout(function () {
                            resolve(argument + " resolved");
                        }, 15);
                    });
                };
                async.asyncify(promisified)("argument", function (err, value) {
                    if (err) {
                        return done(new Error("should not get an error here"));
                    }
                    expect(value).to.equal("argument resolved");
                    done();
                });
            });

            it('reject', function(done) {
                var promisified = function(argument) {
                    return new Promise(function (resolve, reject) {
                        reject(argument + " rejected");
                    });
                };
                async.asyncify(promisified)("argument", function (err) {
                    assert(err);
                    expect(err.message).to.equal("argument rejected");
                    done();
                });
            });

            it('callback error', function(done) {
                var promisified = function(argument) {
                    return new Promise(function (resolve) {
                        resolve(argument + " resolved");
                    });
                };
                var call_count = 0;
                async.asyncify(promisified)("argument", function () {
                    call_count++;
                    if (call_count === 1) {
                        throw new Error("error in callback");
                    }
                });
                setTimeout(function () {
                    expect(call_count).to.equal(1);
                    done();
                }, 15);
            });
        }

        describe('native-promise-only', function() {
            var Promise = require('native-promise-only');
            promisifiedTests.call(this, Promise);
        });

        describe('bluebird', function() {
            var Promise = require('bluebird');
            // Bluebird reports unhandled rejections to stderr. We handle it because we expect
            // unhandled rejections:
            Promise.onPossiblyUnhandledRejection(function ignoreRejections() {});
            promisifiedTests.call(this, Promise);
        });

        describe('es6-promise', function() {
            var Promise = require('es6-promise').Promise;
            promisifiedTests.call(this, Promise);
        });

        describe('rsvp', function() {
            var Promise = require('rsvp').Promise;
            promisifiedTests.call(this, Promise);
        });
    });
});
