var async = require('../lib/async');
var expect = require('chai').expect;
var isBrowser = require('./support/is_browser');

describe('apply', function () {
    context('thisArg', function () {
        var MyClass = function () {
            this.counter = 1;
        };            
        MyClass.prototype.increment = function () {
            return ++this.counter;
        };
        
        it('regular', function (done) {
            var a = new MyClass();
            expect(a.increment()).to.eql(2);
            expect(a.increment()).to.eql(3);
            expect(a.counter).to.eql(3);
            
            var b = new MyClass();
            expect(b.increment.apply(b)).to.eql(2);
            expect(b.increment.apply(b)).to.eql(3);
            expect(b.counter).to.eql(3);

            var c = new MyClass();
            expect(c.increment.apply(null)).to.eql(NaN);
            
            done();
        });
        
        it('async.apply', function (done) {
            var a = new MyClass();
            async.apply(a.increment)();
            expect(a.counter).to.eql(1); // should be 2
            done();
        });
    });
});
