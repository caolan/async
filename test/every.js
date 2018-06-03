var async = require('../lib');
var expect = require('chai').expect;
var _ = require('lodash');

describe("every", function () {

    it('everyLimit true', function(done){
        async.everyLimit([3,1,2], 1, function(x, callback){
            setTimeout(function(){callback(null, x >= 1);}, 0);
        }, function(err, result){
            expect(err).to.equal(null);
            expect(result).to.equal(true);
            done();
        });
    });

    it('everyLimit false', function(done){
        async.everyLimit([3,1,2], 2, function(x, callback){
            setTimeout(function(){callback(null, x === 2);}, 0);
        }, function(err, result){
            expect(err).to.equal(null);
            expect(result).to.equal(false);
            done();
        });
    });

    it('everyLimit short-circuit', function(done){
        var calls = 0;
        async.everyLimit([3,1,2], 1, function(x, callback){
            calls++;
            callback(null, x === 1);
        }, function(err, result){
            expect(err).to.equal(null);
            expect(result).to.equal(false);
            expect(calls).to.equal(1);
            done();
        });
    });


    it('true', function(done){
        async.every([1,2,3], function(x, callback){
            setTimeout(function(){callback(null, true);}, 0);
        }, function(err, result){
            expect(err).to.equal(null);
            expect(result).to.equal(true);
            done();
        });
    });

    it('false', function(done){
        async.every([1,2,3], function(x, callback){
            setTimeout(function(){callback(null, x % 2);}, 0);
        }, function(err, result){
            expect(err).to.equal(null);
            expect(result).to.equal(false);
            done();
        });
    });

    it('early return', function(done){
        var call_order = [];
        async.every([1,2,3], function(x, callback){
            setTimeout(function(){
                call_order.push(x);
                callback(null, x === 1);
            }, x*5);
        }, function(){
            call_order.push('callback');
        });
        setTimeout(function(){
            expect(call_order).to.eql([1,2,'callback',3]);
            done();
        }, 25);
    });

    it('error', function(done){
        async.every([1,2,3], function(x, callback){
            setTimeout(function(){callback('error');}, 0);
        }, function(err, result){
            expect(err).to.equal('error');
            expect(result).to.not.exist;
            done();
        });
    });

    it('everySeries doesn\'t cause stack overflow (#1293)', function(done) {
        var arr = _.range(10000);
        let calls = 0;
        async.everySeries(arr, function(data, cb) {
            calls += 1;
            async.setImmediate(_.partial(cb, null, false));
        }, function(err) {
            expect(err).to.equal(null);
            expect(calls).to.equal(1);
            done();
        });
    });

    it('everyLimit doesn\'t cause stack overflow (#1293)', function(done) {
        var arr = _.range(10000);
        let calls = 0;
        async.everyLimit(arr, 100, function(data, cb) {
            calls += 1;
            async.setImmediate(_.partial(cb, null, false));
        }, function(err) {
            expect(err).to.equal(null);
            expect(calls).to.equal(100);
            done();
        });
    });

    it('all alias', function(){
        expect(async.all).to.equal(async.every);
    });

    it('allLimit alias', function(){
        expect(async.allLimit).to.equal(async.everyLimit);
    });

    it('allSeries alias', function(){
        expect(async.allSeries).to.be.a('function');
        expect(async.allSeries).to.equal(async.everySeries);
    });

});
