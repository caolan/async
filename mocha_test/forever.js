var async = require('../lib/async');
var expect = require('chai').expect;
var isBrowser = require('./support/is_browser');

describe('forever', function(){
    context('function is asynchronous', function(){
        it('executes the function over and over until it yields an error', function(done){
            var counter = 0;
            function addOne(callback) {
                counter++;
                if (counter === 50) {
                    return callback('too big!');
                }
                async.setImmediate(function () {
                    callback();
                });
            }
            async.forever(addOne, function (err) {
                expect(err).to.eql('too big!');
                expect(counter).to.eql(50);
                done();
            });
        });
    });

    context('function is synchronous', function(){
        it('does not cause a stack overflow', function(done){
            if (isBrowser()) return done(); // this will take forever in a browser
            var counter = 0;
            function addOne(callback) {
                counter++;
                if (counter === 50000) { // needs to be huge to potentially overflow stack in node
                    return callback('too big!');
                }
                callback();
            }
            async.forever(addOne, function (err) {
                expect(err).to.eql('too big!');
                expect(counter).to.eql(50000);
                done();
            });
        });
    });
});
