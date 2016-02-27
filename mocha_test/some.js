var async = require('../lib');
var expect = require('chai').expect;

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
            }, x*25);
        }, function(){
            call_order.push('callback');
        });
        setTimeout(function(){
            expect(call_order).to.eql([1,'callback',2,3]);
            done();
        }, 100);
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

    it('any alias', function(){
        expect(async.any).to.equal(async.some);
    });


});
