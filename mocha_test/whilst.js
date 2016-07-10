var async = require('../lib');
var expect = require('chai').expect;
var assert = require('assert');

describe('whilst', function(){
    it('whilst', function(done) {
        var call_order = [];

        var count = 0;
        async.whilst(
            function (c) {
                expect(c).to.equal(undefined);
                call_order.push(['test', count]);
                return (count < 5);
            },
            function (cb) {
                call_order.push(['iteratee', count]);
                count++;
                cb(null, count);
            },
            function (err, result) {
                assert(err === null, err + " passed instead of 'null'");
                expect(result).to.equal(5, 'last result passed through');
                expect(call_order).to.eql([
                    ['test', 0],
                    ['iteratee', 0], ['test', 1],
                    ['iteratee', 1], ['test', 2],
                    ['iteratee', 2], ['test', 3],
                    ['iteratee', 3], ['test', 4],
                    ['iteratee', 4], ['test', 5],
                ]);
                expect(count).to.equal(5);
                done();
            }
        );
    });

    it('whilst optional callback', function(done) {
        var counter = 0;
        async.whilst(
            function () { return counter < 2; },
            function (cb) {
                counter++;
                cb();
            }
        );
        expect(counter).to.equal(2);
        done();
    });

    it('doWhilst', function(done) {
        var call_order = [];

        var count = 0;
        async.doWhilst(
            function (cb) {
                call_order.push(['iteratee', count]);
                count++;
                cb(null, count);
            },
            function (c) {
                expect(c).to.equal(count);
                call_order.push(['test', count]);
                return (count < 5);
            },
            function (err, result) {
                assert(err === null, err + " passed instead of 'null'");
                expect(result).to.equal(5, 'last result passed through');
                expect(call_order).to.eql([
                    ['iteratee', 0], ['test', 1],
                    ['iteratee', 1], ['test', 2],
                    ['iteratee', 2], ['test', 3],
                    ['iteratee', 3], ['test', 4],
                    ['iteratee', 4], ['test', 5]
                ]);
                expect(count).to.equal(5);
                done();
            }
        );
    });

    it('doWhilst callback params', function(done) {
        var call_order = [];
        var count = 0;
        async.doWhilst(
            function (cb) {
                call_order.push(['iteratee', count]);
                count++;
                cb(null, count);
            },
            function (c) {
                call_order.push(['test', c]);
                return (c < 5);
            },
            function (err, result) {
                if (err) throw err;
                expect(result).to.equal(5, 'last result passed through');
                expect(call_order).to.eql([
                    ['iteratee', 0], ['test', 1],
                    ['iteratee', 1], ['test', 2],
                    ['iteratee', 2], ['test', 3],
                    ['iteratee', 3], ['test', 4],
                    ['iteratee', 4], ['test', 5]
                ]);
                expect(count).to.equal(5);
                done();
            }
        );
    });

    it('doWhilst - error', function(done) {
        var error = new Error('asdas');

        async.doWhilst(
            function (cb) {
                cb(error);
            },
            function () {},
            function (err) {
                expect(err).to.equal(error);
                done();
            }
        );
    });
});
