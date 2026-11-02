var async = require('../lib');
var assert = require('assert');

describe('autoInject special task keys review', () => {
    it('preserves an independent special task', (done) => {
        async.autoInject({
            ['__proto__']: callback => callback(null, 2)
        }, (err, results) => {
            assert.ifError(err);
            assert.strictEqual(Object.getPrototypeOf(results), Object.prototype);
            assert.strictEqual(Object.prototype.hasOwnProperty.call(results, '__proto__'), true);
            assert.strictEqual(results.__proto__, 2);
            done();
        });
    });

    it('injects the special task result using explicit dependencies', (done) => {
        async.autoInject({
            first: callback => callback(null, 2),
            ['__proto__']: ['first', (first, callback) => callback(null, first + 3)],
            last: ['__proto__', (value, callback) => callback(null, value + 5)]
        }, (err, results) => {
            assert.ifError(err);
            assert.strictEqual(results.last, 10);
            assert.strictEqual(Object.getOwnPropertyDescriptor(results, '__proto__').value, 5);
            done();
        });
    });

    it('injects the special task result using named parameters', (done) => {
        async.autoInject({
            ['__proto__']: callback => callback(null, 4),
            last(__proto__, callback) {
                callback(null, __proto__ + 1);
            }
        }, (err, results) => {
            assert.ifError(err);
            assert.strictEqual(results.last, 5);
            done();
        });
    });
});
