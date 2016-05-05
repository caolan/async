var async = require('../lib');
var expect = require('chai').expect;
var assert = require('assert');

describe("each", function() {

    function eachIteratee(args, x, callback) {
        setTimeout(function(){
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
        async.each([1,3,2], eachIteratee.bind(this, args), function(err){
            assert(err === null, err + " passed instead of 'null'");
            expect(args).to.eql([1,2,3]);
            done();
        });
    });

    it('each extra callback', function(done) {
        var count = 0;
        async.each([1,3,2], function(val, callback) {
            count++;
            var done_ = count == 3;
            callback();
            assert.throws(callback);
            if (done_) {
                done();
            }
        });
    });

    it('each empty array', function(done) {
        async.each([], function(x, callback){
            assert(false, 'iteratee should not be called');
            callback();
        }, function(err){
            if (err) throw err;
            assert(true, 'should call callback');
        });
        setTimeout(done, 25);
    });


    it('each empty array, with other property on the array', function(done) {
        var myArray = [];
        myArray.myProp = "anything";
        async.each(myArray, function(x, callback){
            assert(false, 'iteratee should not be called');
            callback();
        }, function(err){
            if (err) throw err;
            assert(true, 'should call callback');
        });
        setTimeout(done, 25);
    });


    it('each error', function(done) {
        async.each([1,2,3], function(x, callback){
            callback('error');
        }, function(err){
            expect(err).to.equal('error');
        });
        setTimeout(done, 50);
    });

    it('each no callback', function(done) {
        async.each([1], eachNoCallbackIteratee.bind(this, done));
    });

    it('eachSeries', function(done) {
        var args = [];
        async.eachSeries([1,3,2], eachIteratee.bind(this, args), function(err){
            assert(err === null, err + " passed instead of 'null'");
            expect(args).to.eql([1,3,2]);
            done();
        });
    });

    it('eachSeries empty array', function(done) {
        async.eachSeries([], function(x, callback){
            assert(false, 'iteratee should not be called');
            callback();
        }, function(err){
            if (err) throw err;
            assert(true, 'should call callback');
        });
        setTimeout(done, 25);
    });

    it('eachSeries array modification', function(done) {
        var arr = [1, 2, 3, 4];
        async.eachSeries(arr, function (x, callback) {
            async.setImmediate(callback);
        }, function () {
            assert(true, 'should call callback');
        });

        arr.pop();
        arr.splice(0, 1);

        setTimeout(done, 50);
    });

    // bug #782.  Remove in next major release
    it('eachSeries single item', function(done) {
        var sync = true;
        async.eachSeries([1], function (i, cb) {
            cb(null);
        }, function () {
            assert(sync, "callback not called on same tick");
        });
        sync = false;
        done();
    });

    // bug #782.  Remove in next major release
    it('eachSeries single item', function(done) {
        var sync = true;
        async.eachSeries([1], function (i, cb) {
            cb(null);
        }, function () {
            assert(sync, "callback not called on same tick");
        });
        sync = false;
        done();
    });

    it('eachSeries error', function(done) {
        var call_order = [];
        async.eachSeries([1,2,3], function(x, callback){
            call_order.push(x);
            callback('error');
        }, function(err){
            expect(call_order).to.eql([1]);
            expect(err).to.equal('error');
        });
        setTimeout(done, 50);
    });

    it('eachSeries no callback', function(done) {
        async.eachSeries([1], eachNoCallbackIteratee.bind(this, done));
    });


    it('eachLimit', function(done) {
        var args = [];
        var arr = [0,1,2,3,4,5,6,7,8,9];
        async.eachLimit(arr, 2, function(x,callback){
            setTimeout(function(){
                args.push(x);
                callback();
            }, x*5);
        }, function(err){
            assert(err === null, err + " passed instead of 'null'");
            expect(args).to.eql(arr);
            done();
        });
    });

    it('eachLimit empty array', function(done) {
        async.eachLimit([], 2, function(x, callback){
            assert(false, 'iteratee should not be called');
            callback();
        }, function(err){
            if (err) throw err;
            assert(true, 'should call callback');
        });
        setTimeout(done, 25);
    });

    it('eachLimit limit exceeds size', function(done) {
        var args = [];
        var arr = [0,1,2,3,4,5,6,7,8,9];
        async.eachLimit(arr, 20, eachIteratee.bind(this, args), function(err){
            if (err) throw err;
            expect(args).to.eql(arr);
            done();
        });
    });

    it('eachLimit limit equal size', function(done) {
        var args = [];
        var arr = [0,1,2,3,4,5,6,7,8,9];
        async.eachLimit(arr, 10, eachIteratee.bind(this, args), function(err){
            if (err) throw err;
            expect(args).to.eql(arr);
            done();
        });
    });

    it('eachLimit zero limit', function(done) {
        async.eachLimit([0,1,2,3,4,5], 0, function(x, callback){
            assert(false, 'iteratee should not be called');
            callback();
        }, function(err){
            if (err) throw err;
            assert(true, 'should call callback');
        });
        setTimeout(done, 25);
    });

    it('eachLimit error', function(done) {
        var arr = [0,1,2,3,4,5,6,7,8,9];
        var call_order = [];

        async.eachLimit(arr, 3, function(x, callback){
            call_order.push(x);
            if (x === 2) {
                callback('error');
            }
        }, function(err){
            expect(call_order).to.eql([0,1,2]);
            expect(err).to.equal('error');
        });
        setTimeout(done, 25);
    });

    it('eachLimit no callback', function(done) {
        async.eachLimit([1], 1, eachNoCallbackIteratee.bind(this, done));
    });

    it('eachLimit synchronous', function(done) {
        var args = [];
        var arr = [0,1,2];
        async.eachLimit(arr, 5, function(x,callback){
            args.push(x);
            callback();
        }, function(err){
            if (err) throw err;
            expect(args).to.eql(arr);
            done();
        });
    });

    it('eachLimit does not continue replenishing after error', function(done) {
        var started = 0;
        var arr = [0,1,2,3,4,5,6,7,8,9];
        var delay = 10;
        var limit = 3;
        var maxTime = 10 * arr.length;

        async.eachLimit(arr, limit, function(x, callback) {
            started ++;
            if (started === 3) {
                return callback(new Error ("Test Error"));
            }
            setTimeout(function(){
                callback();
            }, delay);
        }, function(){});

        setTimeout(function(){
            expect(started).to.equal(3);
            done();
        }, maxTime);
    });

    it('forEach alias', function(done) {
        assert.strictEqual(async.each, async.forEach);
        done();
    });

    it('forEachSeries alias', function(done) {
        assert.strictEqual(async.eachSeries, async.forEachSeries);
        done();
    });

    it('forEachLimit alias', function(done) {
        assert.strictEqual(async.eachLimit, async.forEachLimit);
        done();
    });
});
