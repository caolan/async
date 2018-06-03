var async = require('../lib');
var expect = require('chai').expect;
var _ = require('lodash');

describe("some", function () {

    it('some true', function(done){
        async.some([3,1,2], function(x, callback){
            setTimeout(function(){callback(null, x === 1);}, 0);
        }, function(err, result){
            expect(err).to.equal(null);
            expect(result).to.equal(true);
            done();
        });
    });

    it('some false', function(done){
        async.some([3,1,2], function(x, callback){
            setTimeout(function(){callback(null, x === 10);}, 0);
        }, function(err, result){
            expect(err).to.equal(null);
            expect(result).to.equal(false);
            done();
        });
    });

    it('some early return', function(done){
        var call_order = [];
        async.some([1,2,3], function(x, callback){
            setTimeout(function(){
                call_order.push(x);
                callback(null, x === 1);
            }, x*5);
        }, function(){
            call_order.push('callback');
        });
        setTimeout(function(){
            expect(call_order).to.eql([1,'callback',2,3]);
            done();
        }, 25);
    });

    it('some error', function(done){
        async.some([3,1,2], function(x, callback){
            setTimeout(function(){callback('error');}, 0);
        }, function(err, result){
            expect(err).to.equal('error');
            expect(result).to.not.exist;
            done();
        });
    });

    it('some no callback', function(done) {
        var calls = [];

        async.some([1, 2, 3], function (val, cb) {
            calls.push(val);
            cb();
        });

        setTimeout(function () {
            expect(calls).to.eql([1, 2, 3]);
            done();
        }, 10);
    });

    it('someLimit true', function(done){
        async.someLimit([3,1,2], 2, function(x, callback){
            setTimeout(function(){callback(null, x === 2);}, 0);
        }, function(err, result){
            expect(err).to.equal(null);
            expect(result).to.equal(true);
            done();
        });
    });

    it('someLimit false', function(done){
        async.someLimit([3,1,2], 2, function(x, callback){
            setTimeout(function(){callback(null, x === 10);}, 0);
        }, function(err, result){
            expect(err).to.equal(null);
            expect(result).to.equal(false);
            done();
        });
    });

    it('someLimit short-circuit', function(done){
        var calls = 0;
        async.someLimit([3,1,2], 1, function(x, callback){
            calls++;
            callback(null, x === 1);
        }, function(err, result){
            expect(err).to.equal(null);
            expect(result).to.equal(true);
            expect(calls).to.equal(2);
            done();
        });
    });


    it('someSeries doesn\'t cause stack overflow (#1293)', function(done) {
        var arr = _.range(10000);
        let calls = 0;
        async.someSeries(arr, function(data, cb) {
            calls += 1;
            async.setImmediate(_.partial(cb, null, true));
        }, function(err) {
            expect(err).to.equal(null);
            expect(calls).to.equal(1);
            done();
        });
    });

    it('someLimit doesn\'t cause stack overflow (#1293)', function(done) {
        var arr = _.range(10000);
        let calls = 0;
        async.someLimit(arr, 100, function(data, cb) {
            calls += 1;
            async.setImmediate(_.partial(cb, null, true));
        }, function(err) {
            expect(err).to.equal(null);
            expect(calls).to.equal(100);
            done();
        });
    });

    it('any alias', function(){
        expect(async.any).to.equal(async.some);
    });

    it('anyLimit alias', function(){
        expect(async.anyLimit).to.equal(async.someLimit);
    });

    it('anySeries alias', function(){
        expect(async.anySeries).to.be.a('function');
        expect(async.anySeries).to.equal(async.someSeries);
    });


});
