var {isAsync} = require('../lib/internal/wrapAsync');

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

function supportsAsyncGenerators() {
    var supported;
    try {
        /* eslint no-eval: 0 */
        supported = eval('(async function * () { yield await 1 })');
    } catch (e) {
        supported = false;
    }
    return supported;
}

describe('async function support', function () {
    this.timeout(200);

    if (supportsAsync()) {
        require('./es2017/asyncFunctions.js').call(this);
        describe('awaitable functions', () => {
            require('./es2017/awaitableFunctions.js').call(this);
        });
    } else {
        it('should not test async functions in this environment');
    }

    if (supportsAsyncGenerators()) {
        require('./es2017/asyncGenerators.js').call(this);
    } else {
        it('should not test async generators in this environment');
    }
});
