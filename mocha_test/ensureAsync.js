var async = require('../lib');
var expect = require('chai').expect;

describe('ensureAsync', function() {
    var passContext = function(cb) {
        cb(this);
    };

    it('should propely bind context to the wrapped function', function(done) {

        // call bind after wrapping with ensureAsync
        var context = {context: "post"};
        var postBind = async.ensureAsync(passContext);
        postBind = postBind.bind(context);
        postBind(function(ref) {
            expect(ref).to.equal(context);
            done();
        });
    });

    it('should not override the bound context of a function when wrapping', function(done) {

        // call bind before wrapping with ensureAsync
        var context = {context: "pre"};
        var preBind = passContext.bind(context);
        preBind = async.ensureAsync(preBind);
        preBind(function(ref) {
            expect(ref).to.equal(context);
            done();
        });
    });
});
