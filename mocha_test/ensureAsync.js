import initialParams from '../lib/internal/initialParams';
var expect = require('chai').expect;

describe('initialParams', function() {
  it('should curry any bound context to the wrapped function', function() {
    var passContext = function(args, cb) {
      cb(this);
    };

    // call bind after wrapping with initialParams
    var contextOne = {context: "one"};
    var postBind = initialParams(passContext);
    postBind = postBind.bind(contextOne);
    postBind([], function(ref) {
      expect(ref).to.equal(contextOne);
    });

    // call bind before wrapping with initialParams
    var contextTwo = {context: "two"};
    var preBind = passContext.bind(contextTwo);
    preBind = initialParams(preBind);
    preBind([], function(ref) {
      expect(ref).to.equal(contextTwo);
    });
  });
});
