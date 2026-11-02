var async = require('../lib');
var assert = require('assert');

describe('reflectAll', () => {
    it('reflects every task in a Set', (done) => {
        var error = new Error('task failed');
        var tasks = new Set([
            callback => callback(null, 'first'),
            callback => callback(error),
            callback => callback(null, 'third', 3)
        ]);

        async.parallel(async.reflectAll(tasks), (err, results) => {
            assert.ifError(err);
            assert.deepStrictEqual(results, [
                {value: 'first'},
                {error},
                {value: ['third', 3]}
            ]);
            done();
        });
    });

    it('reflects tasks yielded by a generator', (done) => {
        var calls = [];
        function* tasks() {
            yield callback => {
                calls.push(1);
                callback(null, 1);
            };
            yield callback => {
                calls.push(2);
                callback(null, 2);
            };
        }

        var reflected = async.reflectAll(tasks());
        assert.deepStrictEqual(calls, []);
        async.series(reflected, (err, results) => {
            assert.ifError(err);
            assert.deepStrictEqual(calls, [1, 2]);
            assert.deepStrictEqual(results, [{value: 1}, {value: 2}]);
            done();
        });
    });

    it('returns an empty array for an empty iterable', () => {
        assert.deepStrictEqual(async.reflectAll(new Set()), []);
    });

    it('uses a custom iterator instead of enumerable metadata', (done) => {
        var tasks = {
            description: 'task collection',
            *[Symbol.iterator]() {
                yield callback => callback(null, 'value');
            }
        };

        async.parallel(async.reflectAll(tasks), (err, results) => {
            assert.ifError(err);
            assert.deepStrictEqual(results, [{value: 'value'}]);
            done();
        });
    });
});
