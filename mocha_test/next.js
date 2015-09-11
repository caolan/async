var async = require('../lib/async');
var expect = require('chai').expect;
var isBrowser = require('./support/is_browser');

describe('next', function () {
    it('should work with and without arguments', function (done) {
        async.waterfall([
            function () {
                expect(arguments.length).to.eql(1);
                async.next(arguments);
            },
            function () {
                expect(arguments.length).to.eql(1);
                async.next(arguments, null, 'foo');
            },
            function () {
                expect(arguments.length).to.eql(2);                
                expect(arguments[0]).to.eql('foo');
                async.next(arguments, null, 'foo', 'bar');
            },
            function (foo, bar) {
                expect(arguments.length).to.eql(3);
                expect(foo).to.eql('foo');
                expect(bar).to.eql('bar');
                async.next(arguments, null, 'success')
            },
        ], function (err, result) {
            expect(err).to.eql(null);
            expect(result).to.eql('success');
            done();
        });
    });

    it('nextok should behave almost the same', function (done) {
        async.waterfall([
            function () {
                expect(arguments.length).to.eql(1);
                async.nextok(arguments);
            },
            function () {
                expect(arguments.length).to.eql(1);
                async.nextok(arguments, 'foo');
            },
            function () {
                expect(arguments.length).to.eql(2);                
                expect(arguments[0]).to.eql('foo');
                async.nextok(arguments, 'foo', 'bar');
            },
            function (foo, bar) {
                expect(arguments.length).to.eql(3);
                expect(foo).to.eql('foo');
                expect(bar).to.eql('bar');
                async.nextok(arguments, 'success')
            },
        ], function (err, result) {
            expect(err).to.eql(null);
            expect(result).to.eql('success');
            done();
        });
    });
});

