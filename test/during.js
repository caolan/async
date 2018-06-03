var async = require('../lib');
var expect = require('chai').expect;
var assert = require('assert');

describe('during', function() {

    it('during', function(done) {
        var call_order = [];

        var count = 0;
        async.during(
            function (cb) {
                call_order.push(['test', count]);
                cb(null, count < 5);
            },
            function (cb) {
                call_order.push(['iteratee', count]);
                count++;
                cb(null, count);
            },
            function (err) {
                assert(err === null, err + " passed instead of 'null'");
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

    it('doDuring', function(done) {
        var call_order = [];

        var count = 0;
        async.doDuring(
            function (cb) {
                call_order.push(['iteratee', count]);
                count++;
                cb(null, count);
            },
            function (c, cb) {
                expect(c).to.equal(count);
                call_order.push(['test', count]);
                cb(null, count < 5);
            },
            function (err) {
                assert(err === null, err + " passed instead of 'null'");
                expect(call_order).to.eql([
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

    it('doDuring - error test', function(done) {
        var error = new Error('asdas');

        async.doDuring(
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

    it('doDuring - error iteratee', function(done) {
        var error = new Error('asdas');

        async.doDuring(
            function (cb) {
                cb(null);
            },
            function (cb) {
                cb(error);
            },
            function (err) {
                expect(err).to.equal(error);
                done();
            }
        );
    });
});
