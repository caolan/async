var async = require('../lib');
var expect = require('chai').expect;
var assert = require('assert');

describe('callIf', function() {
    var varToMutate = 0;

    function fn(callback){
        varToMutate = 1;
        callback(null, "a value");
    };

    function errFn(callback) { // eslint-disable-line
        callback(new Error());
    };

    function condFunc(arg) {
        return !!arg;
    }

    it('calls function if conditional is truthy', function(done) {
        varToMutate = 0;
        async.callIf(fn, 1 === 1, function(err) {
            assert(err === null, err + " passed instead of 'null'");
            expect(varToMutate).to.eql(1);
            done();
        });
    });

    it('calls function if cond returns truthy', function(done) {
        varToMutate = 0;
        async.callIf(fn, condFunc("some value"), function(err) {
            assert(err === null, err + " passed instead of 'null'");
            expect(varToMutate).to.eql(1);
            done();
        });
    });

    it('passes a value to the callback', function(done) {
        async.callIf(fn, 1 === 1, function(err, val) {
            assert(err === null, err + " passed instead of 'null'");
            expect(val).to.eql("a value");
            done();
        });
    });

    it('passes the conditional to the callback', function(done) {
        async.callIf(fn, "a string", function(err, val, cond) {
            assert(err === null, err + " passed instead of 'null'");
            expect(cond).to.eql("a string");
            done();
        });
    });

    it('does not call if conditional is falsey', function(done) {
        async.callIf(fn, 1 === 2, function(err, val) {
            assert(err === null, err + " passed instead of 'null'");
            expect(val).to.be.null;
            done();
        });
    });

    it('does not call if cond returns falsey', function(done) {
        async.callIf(fn, condFunc(false), function(err, val) {
            assert(err === null, err + " passed instead of 'null'");
            expect(val).to.be.null;
            done();
        });
    });

    it('passes the error', function(done) {
        async.callIf(errFn, true, function(err, val) {
            expect(err).to.be.an('error');
            expect(val).to.be.undefined;
            done();
        });
    });

});
