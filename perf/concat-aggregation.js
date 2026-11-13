// Run the same file against the base and candidate source trees.
// Synchronous one-item results isolate aggregation from I/O latency.
require('babel-register');
var assert = require('assert');
var {performance} = require('perf_hooks');
var concatLimit = require('../lib/concatLimit').default;

function sample(input) {
    var actual;
    var start = performance.now();
    concatLimit(input, 8, (value, next) => next(null, [value]), (err, result) => {
        assert.ifError(err);
        actual = result;
    });
    var elapsed = performance.now() - start;
    assert.deepStrictEqual(actual, input);
    return elapsed;
}

var warmup = Array.from({length: 1000}, (_, i) => i);
for (var i = 0; i < 3; i++) sample(warmup);
var results = [10000, 20000, 40000].map(size => {
    var input = Array.from({length: size}, (_, index) => index);
    var milliseconds = Array.from({length: 5}, () => sample(input));
    var sorted = milliseconds.slice().sort((a, b) => a - b);
    return {size, medianMs: sorted[2], milliseconds};
});
console.log(JSON.stringify({node: process.version, platform: process.platform, results}, null, 2));
