var isAsync = require('../lib/internal/wrapAsync').isAsync;

function supportsAsync() {
    var supported;
    try {
        /* eslint no-eval: 0 */
        supported = isAsync(eval('(async function () {})'));
    } catch (e) {
        supported = false;
    }
    return supported;
}

describe('async function support', function () {
    this.timeout(100);

    if (supportsAsync()) {
        require('./es2017/asyncFunctions.js')();
    } else {
        it('should not test async functions in this environment');
    }
});
