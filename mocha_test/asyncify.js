var async = require('../lib');
var assert = require('assert');
var expect = require('chai').expect;
var isBrowser = require('./support/is_browser');

describe('asyncify', function(done){

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
         async.asyncify(function (x, y, z) {
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
        if (isBrowser()) {
            // node only tests
            return;
        }

        var names = [
            'native-promise-only',
            'bluebird',
            'es6-promise',
            'rsvp'
        ];

        names.forEach(function(name) {
            describe(name, function() {

                var Promise = require(name);
                if (typeof Promise.Promise === 'function') {
                    Promise = Promise.Promise;
                }

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
            });
        });
    });
});
