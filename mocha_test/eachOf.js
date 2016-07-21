var async = require('../lib');
var expect = require('chai').expect;
var assert = require('assert');
var _ = require('lodash');

describe("eachOf", function() {

    function forEachOfNoCallbackIteratee(done, x, key, callback) {
        expect(x).to.equal(1);
        expect(key).to.equal("a");
        callback();
        done();
    }

    function forEachOfIteratee(args, value, key, callback) {
        setTimeout(function(){
            args.push(key, value);
            callback();
        }, value*25);
    }

    it('eachOf alias', function(done) {
        expect(async.eachOf).to.equal(async.forEachOf);
        done();
    });

    it('eachOfLimit alias', function(done) {
        expect(async.eachOfLimit).to.equal(async.forEachOfLimit);
        done();
    });

    it('eachOfSeries alias', function(done) {
        expect(async.eachOfSeries).to.equal(async.forEachOfSeries);
        done();
    });

    it('forEachOf', function(done) {
        var args = [];
        async.forEachOf({ a: 1, b: 2 }, forEachOfIteratee.bind(this, args), function(err){
            assert(err === null, err + " passed instead of 'null'");
            expect(args).to.eql(["a", 1, "b", 2]);
            done();
        });
    });

    it('forEachOf - instant resolver', function(done) {
        var args = [];
        async.forEachOf({ a: 1, b: 2 }, function(x, k, cb) {
            args.push(k, x);
            cb();
        }, function(){
            // ensures done callback isn't called before all items iterated
            expect(args).to.eql(["a", 1, "b", 2]);
            done();
        });
    });

    it('forEachOf empty object', function(done) {
        async.forEachOf({}, function(value, key, callback){
            assert(false, 'iteratee should not be called');
            callback();
        }, function(err) {
            if (err) throw err;
            assert(true, 'should call callback');
        });
        setTimeout(done, 25);
    });

    it('forEachOf empty array', function(done) {
        async.forEachOf([], function(value, key, callback){
            assert(false, 'iteratee should not be called');
            callback();
        }, function(err) {
            if (err) throw err;
            assert(true, 'should call callback');
        });
        setTimeout(done, 25);
    });

    it('forEachOf error', function(done) {
        async.forEachOf({ a: 1, b: 2 }, function(value, key, callback) {
            callback('error');
        }, function(err){
            expect(err).to.equal('error');
        });
        setTimeout(done, 50);
    });

    it('forEachOf no callback', function(done) {
        async.forEachOf({ a: 1 }, forEachOfNoCallbackIteratee.bind(this, done));
    });


    it('forEachOf with array', function(done) {
        var args = [];
        async.forEachOf([ "a", "b" ], forEachOfIteratee.bind(this, args), function(err){
            if (err) throw err;
            expect(args).to.eql([0, "a", 1, "b"]);
            done();
        });
    });

    it('forEachOf with Set (iterators)', function(done) {
        if (typeof Set !== 'function')
            return done();

        var args = [];
        var set = new Set();
        set.add("a");
        set.add("b");
        async.forEachOf(set, forEachOfIteratee.bind(this, args), function(err){
            if (err) throw err;
            expect(args).to.eql([0, "a", 1, "b"]);
            done();
        });
    });

    it('forEachOf with Map (iterators)', function(done) {
        if (typeof Map !== 'function')
            return done();

        var args = [];
        var map = new Map();
        map.set(1, "a");
        map.set(2, "b");
        async.forEachOf(map, forEachOfIteratee.bind(this, args), function(err){
            if (err) throw err;
            expect(args).to.eql([0, [1, "a"], 1, [2, "b"]]);
            done();
        });
    });

    it('forEachOfSeries', function(done) {
        var args = [];
        async.forEachOfSeries({ a: 1, b: 2 }, forEachOfIteratee.bind(this, args), function(err){
            assert(err === null, err + " passed instead of 'null'");
            expect(args).to.eql([ "a", 1, "b", 2 ]);
            done();
        });
    });

    it('forEachOfSeries empty object', function(done) {
        async.forEachOfSeries({}, function(x, callback){
            assert(false, 'iteratee should not be called');
            callback();
        }, function(err){
            if (err) throw err;
            assert(true, 'should call callback');
        });
        setTimeout(done, 25);
    });

    it('forEachOfSeries error', function(done) {
        var call_order = [];
        async.forEachOfSeries({ a: 1, b: 2 }, function(value, key, callback){
            call_order.push(value, key);
            callback('error');
        }, function(err){
            expect(call_order).to.eql([ 1, "a" ]);
            expect(err).to.equal('error');
        });
        setTimeout(done, 50);
    });

    it('forEachOfSeries no callback', function(done) {
        async.forEachOfSeries({ a: 1 }, forEachOfNoCallbackIteratee.bind(this, done));
    });

    it('forEachOfSeries with array', function(done) {
        var args = [];
        async.forEachOfSeries([ "a", "b" ], forEachOfIteratee.bind(this, args), function(err){
            if (err) throw err;
            expect(args).to.eql([ 0, "a", 1, "b" ]);
            done();
        });
    });

    it('forEachOfSeries with Set (iterators)', function(done) {
        if (typeof Set !== 'function')
            return done();

        var args = [];
        var set = new Set();
        set.add("a");
        set.add("b");
        async.forEachOfSeries(set, forEachOfIteratee.bind(this, args), function(err){
            if (err) throw err;
            expect(args).to.eql([0, "a", 1, "b"]);
            done();
        });
    });

    it('forEachOfSeries with Map (iterators)', function(done) {
        if (typeof Map !== 'function')
            return done();

        var args = [];
        var map = new Map();
        map.set(1, "a");
        map.set(2, "b");
        async.forEachOfSeries(map, forEachOfIteratee.bind(this, args), function(err){
            if (err) throw err;
            expect(args).to.eql([0, [1, "a"], 1, [2, "b"]]);
            done();
        });
    });

    it('forEachOfLimit', function(done) {
        var args = [];
        var obj = { a: 1, b: 2, c: 3, d: 4 };
        async.forEachOfLimit(obj, 2, function(value, key, callback){
            setTimeout(function(){
                args.push(value, key);
                callback();
            }, value * 5);
        }, function(err){
            assert(err === null, err + " passed instead of 'null'");
            expect(args).to.eql([ 1, "a", 2, "b", 3, "c", 4, "d" ]);
            done();
        });
    });

    it('forEachOfLimit empty object', function(done) {
        async.forEachOfLimit({}, 2, function(value, key, callback){
            assert(false, 'iteratee should not be called');
            callback();
        }, function(err){
            if (err) throw err;
            assert(true, 'should call callback');
        });
        setTimeout(done, 25);
    });

    it('forEachOfLimit limit exceeds size', function(done) {
        var args = [];
        var obj = { a: 1, b: 2, c: 3, d: 4, e: 5 };
        async.forEachOfLimit(obj, 10, forEachOfIteratee.bind(this, args), function(err){
            if (err) throw err;
            expect(args).to.eql([ "a", 1, "b", 2, "c", 3, "d", 4, "e", 5 ]);
            done();
        });
    });

    it('forEachOfLimit limit equal size', function(done) {
        var args = [];
        var obj = { a: 1, b: 2, c: 3, d: 4, e: 5 };
        async.forEachOfLimit(obj, 5, forEachOfIteratee.bind(this, args), function(err){
            if (err) throw err;
            expect(args).to.eql([ "a", 1, "b", 2, "c", 3, "d", 4, "e", 5 ]);
            done();
        });
    });

    it('forEachOfLimit zero limit', function(done) {
        async.forEachOfLimit({ a: 1, b: 2 }, 0, function(x, callback){
            assert(false, 'iteratee should not be called');
            callback();
        }, function(err){
            if (err) throw err;
            assert(true, 'should call callback');
        });
        setTimeout(done, 25);
    });

    it('forEachOfLimit no limit', function(done) {
        var count = 0;
        async.forEachOfLimit(_.range(100), Infinity, function(x, i, callback){
            count++;
            callback();
        }, function(err){
            if (err) throw err;
            expect(count).to.equal(100);
        });
        setTimeout(done, 25);
    });

    it('forEachOfLimit error', function(done) {
        var obj = { a: 1, b: 2, c: 3, d: 4, e: 5 };
        var call_order = [];

        async.forEachOfLimit(obj, 3, function(value, key, callback){
            call_order.push(value, key);
            if (value === 2) {
                callback('error');
            }
        }, function(err){
            expect(call_order).to.eql([ 1, "a", 2, "b" ]);
            expect(err).to.equal('error');
        });
        setTimeout(done, 25);
    });

    it('forEachOfLimit no callback', function(done) {
        async.forEachOfLimit({ a: 1 }, 1, forEachOfNoCallbackIteratee.bind(this, done));
    });

    it('forEachOfLimit synchronous', function(done) {
        var args = [];
        var obj = { a: 1, b: 2 };
        async.forEachOfLimit(obj, 5, forEachOfIteratee.bind(this, args), function(err){
            if (err) throw err;
            expect(args).to.eql([ "a", 1, "b", 2 ]);
            done();
        });
    });

    it('forEachOfLimit with array', function(done) {
        var args = [];
        var arr = [ "a", "b" ];
        async.forEachOfLimit(arr, 1, forEachOfIteratee.bind(this, args), function (err) {
            if (err) throw err;
            expect(args).to.eql([ 0, "a", 1, "b" ]);
            done();
        });
    });

    it('forEachOfLimit with Set (iterators)', function(done) {
        if (typeof Set !== 'function')
            return done();

        var args = [];
        var set = new Set();
        set.add("a");
        set.add("b");
        async.forEachOfLimit(set, 1, forEachOfIteratee.bind(this, args), function(err){
            if (err) throw err;
            expect(args).to.eql([0, "a", 1, "b"]);
            done();
        });
    });

    it('forEachOfLimit with Map (iterators)', function(done) {
        if (typeof Map !== 'function')
            return done();

        var args = [];
        var map = new Map();
        map.set(1, "a");
        map.set(2, "b");
        async.forEachOfLimit(map, 1, forEachOfIteratee.bind(this, args), function(err){
            if (err) throw err;
            expect(args).to.eql([0, [1, "a"], 1, [2, "b"]]);
            done();
        });
    });
});
