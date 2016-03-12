var async = require('../lib');
var expect = require('chai').expect;

describe("setImmediate", function () {

    it('basics', function(done){
        var call_order = [];
        async.setImmediate(function(){call_order.push('two');});
        call_order.push('one');

        setTimeout(function(){
            expect(call_order).to.eql(['one','two']);
            done();
        }, 25);
    });

    it("extra args", function (done) {
        async.setImmediate(function (a, b, c) {
            expect([a, b, c]).to.eql([1, 2, 3]);
            done();
        }, 1, 2, 3);
    });

});
