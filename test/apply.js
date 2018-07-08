var async = require('../lib');
var expect = require('chai').expect;

describe('concat', () => {
    it('apply', (done) => {
        var fn = function(){
            expect(Array.prototype.slice.call(arguments)).to.eql([1,2,3,4]);
        };
        async.apply(fn, 1, 2, 3, 4)();
        async.apply(fn, 1, 2, 3)(4);
        async.apply(fn, 1, 2)(3, 4);
        async.apply(fn, 1)(2, 3, 4);
        async.apply(fn)(1, 2, 3, 4);
        expect(
            async.apply((name) => {return 'hello ' + name;}, 'world')()
        ).to.equal(
            'hello world'
        );
        done();
    });
});
