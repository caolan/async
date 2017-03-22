describe('async function support', function () {
    this.timeout(100);

    var supportsAsync;
    var supportsSymbol = typeof Symbol !== 'undefined';
    try {
        /* eslint no-eval:0 */
        var fn = eval('(async function() {})')
        supportsAsync = supportsSymbol &&
            fn[Symbol.toStringTag] === 'AsyncFunction';
    } catch (e) {
        supportsAsync = false;
    }

    if (supportsAsync) {
        require('./es2017/asyncFunctions.js')();
    } else {
        it('should not test async functions in this environment');
    }
});
