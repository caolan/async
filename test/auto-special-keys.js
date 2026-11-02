var async = require('../lib');
var assert = require('assert');

describe('auto special task keys review', () => {
    function assertOwnResult(results, key, value) {
        assert.strictEqual(Object.getPrototypeOf(results), Object.prototype);
        assert.deepStrictEqual(Object.getOwnPropertyDescriptor(results, key), {
            value,
            writable: true,
            enumerable: true,
            configurable: true
        });
    }

    [undefined, null, 42, 'value', {value: true}].forEach((value, index) => {
        it('preserves an independent special task result ' + index, (done) => {
            async.auto({
                ['__proto__']: callback => callback(null, value)
            }, (err, results) => {
                assert.ifError(err);
                assertOwnResult(results, '__proto__', value);
                done();
            });
        });
    });

    it('runs a special task with dependencies and exposes its result downstream', (done) => {
        async.auto({
            first: callback => callback(null, 2),
            ['__proto__']: ['first', (results, callback) => callback(null, results.first + 3)],
            last: ['__proto__', (results, callback) => callback(null, results.__proto__ + 5)]
        }, (err, results) => {
            assert.ifError(err);
            assertOwnResult(results, '__proto__', 5);
            assert.strictEqual(results.last, 10);
            done();
        });
    });

    it('preserves the special task in partial results when another task fails', (done) => {
        var error = new Error('failure');
        async.auto({
            ['__proto__']: callback => callback(null, 'finished'),
            failed: ['__proto__', (results, callback) => callback(error, 'partial')]
        }, (err, results) => {
            assert.strictEqual(err, error);
            assertOwnResult(results, '__proto__', 'finished');
            assert.strictEqual(results.failed, 'partial');
            done();
        });
    });

    it('preserves partial results returned by a failing special task', (done) => {
        var error = new Error('failure');
        async.auto({
            first: callback => callback(null, 'finished'),
            ['__proto__']: callback => callback(error, 'partial')
        }, (err, results) => {
            assert.strictEqual(err, error);
            assertOwnResult(results, '__proto__', 'partial');
            assert.strictEqual(results.first, 'finished');
            done();
        });
    });

    it('returns special task results through a promise', async () => {
        var results = await async.auto({
            first: callback => callback(null, 7),
            ['__proto__']: ['first', (values, callback) => callback(null, values.first)]
        });
        assertOwnResult(results, '__proto__', 7);
    });
});
