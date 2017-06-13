var slice = require('../lib/internal/slice').default;
var expect = require('chai').expect;

describe('slice', function() {
    it('should slice arrays', function() {
        var arr = ['foo', 'bar', 'baz'];
        var result = slice(arr, 2);
        expect(arr).to.eql(['foo', 'bar', 'baz']);
        expect(result).to.eql(['baz']);
    });

    it('should handle ArrayLike objects', function() {
        var args = {0: 'foo', 1: 'bar', 2: 'baz', length: 3};
        var result = slice(args, 1);
        expect(result).to.be.an('array');
        expect(result).to.eql(['bar', 'baz']);
    });

    it('should handle arguments', function() {
        var foo = function() {
            return slice(arguments, 1);
        };
        var result = foo.apply(null, ['foo', 'bar', 'baz']);
        expect(result).to.be.an('array');
        expect(result).to.eql(['bar', 'baz']);
    });

    it('should return an empty array on an invalid start', function() {
        var result = slice(['foo', 'bar', 'baz'], 10);
        expect(result).to.be.an('array').that.is.empty;
    });
});
