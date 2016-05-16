var async = require('../lib');
var expect = require('chai').expect;

describe('iterator', function() {

    it('iterator', function(done) {
        var call_order = [];
        var iterator = async.iterator([
            function(){call_order.push(1);},
            function(arg1){
                expect(arg1).to.equal('arg1');
                call_order.push(2);
            },
            function(arg1, arg2){
                expect(arg1).to.equal('arg1');
                expect(arg2).to.equal('arg2');
                call_order.push(3);
            }
        ]);
        iterator();
        expect(call_order).to.eql([1]);
        var iterator2 = iterator();
        expect(call_order).to.eql([1,1]);
        var iterator3 = iterator2('arg1');
        expect(call_order).to.eql([1,1,2]);
        var iterator4 = iterator3('arg1', 'arg2');
        expect(call_order).to.eql([1,1,2,3]);
        expect(iterator4).to.equal(null);
        done();
    });

    it('iterator empty array', function(done) {
        var iterator = async.iterator([]);
        expect(iterator()).to.equal(null);
        expect(iterator.next()).to.equal(null);
        done();
    });

    it('iterator.next', function(done) {
        var call_order = [];
        var iterator = async.iterator([
            function(){call_order.push(1);},
            function(arg1){
                expect(arg1).to.equal('arg1');
                call_order.push(2);
            },
            function(arg1, arg2){
                expect(arg1).to.equal('arg1');
                expect(arg2).to.equal('arg2');
                call_order.push(3);
            }
        ]);
        var fn = iterator.next();
        var iterator2 = fn('arg1');
        expect(call_order).to.eql([2]);
        iterator2('arg1','arg2');
        expect(call_order).to.eql([2,3]);
        expect(iterator2.next()).to.equal(null);
        done();
    });
});
