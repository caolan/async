var async = require('../lib');
var expect = require('chai').expect;

describe('constant', function () {

    it('basic usage', function(done){
        var f = async.constant(42, 1, 2, 3);
        f(function (err, value, a, b, c) {
            expect(err).to.equal(null);
            expect(value).to.equal(42);
            expect(a).to.equal(1);
            expect(b).to.equal(2);
            expect(c).to.equal(3);
            done();
        });
    });

    it('called with multiple arguments', function(done){
        var f = async.constant(42, 1, 2, 3);
        f('argument to ignore', 'another argument', function (err, value, a) {
            expect(err).to.equal(null);
            expect(value).to.equal(42);
            expect(a).to.equal(1);
            done();
        });
    });

});
