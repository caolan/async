var async = require('../lib');
var expect = require('chai').expect;

describe("nextTick", function () {

    it('basics', function(done){
        var call_order = [];
        async.nextTick(function(){call_order.push('two');});
        call_order.push('one');
        setTimeout(function(){
            expect(call_order).to.eql(['one','two']);
            done();
        }, 50);
    });

    it('nextTick in the browser @nodeonly', function(done){
        var call_order = [];
        async.nextTick(function(){call_order.push('two');});

        call_order.push('one');
        setTimeout(function(){
            expect(call_order).to.eql(['one','two']);
            done();
        }, 50);
    });

    it("extra args", function (done) {
        async.nextTick(function (a, b, c) {
            expect([a, b, c]).to.eql([1, 2, 3]);
            done();
        }, 1, 2, 3);
    });
});
