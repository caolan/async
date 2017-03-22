var supportsAsync = require('../lib/internal/wrapAsync').supportsAsync;

describe('async function support', function () {
    this.timeout(100);

    if (supportsAsync()) {
        require('./es2017/asyncFunctions.js')();
    } else {
        it('should not test async functions in this environment');
    }
});
