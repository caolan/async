var async = require('../lib');
var expect = require('chai').expect;

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
            }, x*25);
        }, function(){
            call_order.push('callback');
        });
        setTimeout(function(){
            expect(call_order).to.eql([1,2,'callback',3]);
            done();
        }, 100);
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

    it('all alias', function(){
        expect(async.all).to.equal(async.every);
    });

});
