/**
 * NOTE:  We are in the process of migrating these tests to Mocha.  If you are
 * adding a new test, please create a new spec file in mocha_tests/
 */

require('babel-core/register');
var async = require('../lib');

if (!Function.prototype.bind) {
    Function.prototype.bind = function (thisArg) {
        var args = Array.prototype.slice.call(arguments, 1);
        var self = this;
        return function () {
            self.apply(thisArg, args.concat(Array.prototype.slice.call(arguments)));
        };
    };
}

exports['sortBy'] = function(test){
    test.expect(2);

    async.sortBy([{a:1},{a:15},{a:6}], function(x, callback){
        setTimeout(function(){callback(null, x.a);}, 0);
    }, function(err, result){
        test.ok(err === null, err + " passed instead of 'null'");
        test.same(result, [{a:1},{a:6},{a:15}]);
        test.done();
    });
};

exports['sortBy inverted'] = function(test){
    test.expect(1);

    async.sortBy([{a:1},{a:15},{a:6}], function(x, callback){
        setTimeout(function(){callback(null, x.a*-1);}, 0);
    }, function(err, result){
        test.same(result, [{a:15},{a:6},{a:1}]);
        test.done();
    });
};

exports['sortBy error'] = function(test){
    test.expect(1);
    var error = new Error('asdas');
    async.sortBy([{a:1},{a:15},{a:6}], function(x, callback){
        async.setImmediate(function(){
            callback(error);
        });
    }, function(err){
        test.equal(err, error);
        test.done();
    });
};

exports['apply'] = function(test){
    test.expect(6);
    var fn = function(){
        test.same(Array.prototype.slice.call(arguments), [1,2,3,4]);
    };
    async.apply(fn, 1, 2, 3, 4)();
    async.apply(fn, 1, 2, 3)(4);
    async.apply(fn, 1, 2)(3, 4);
    async.apply(fn, 1)(2, 3, 4);
    async.apply(fn)(1, 2, 3, 4);
    test.equals(
        async.apply(function(name){return 'hello ' + name;}, 'world')(),
        'hello world'
    );
    test.done();
};


// generates tests for console functions such as async.log
var console_fn_tests = function(name){

    if (typeof console !== 'undefined') {
        exports[name] = function(test){
            test.expect(5);
            var fn = function(arg1, callback){
                test.equals(arg1, 'one');
                setTimeout(function(){callback(null, 'test');}, 0);
            };
            var fn_err = function(arg1, callback){
                test.equals(arg1, 'one');
                setTimeout(function(){callback('error');}, 0);
            };
            var _console_fn = console[name];
            var _error = console.error;
            console[name] = function(val){
                test.equals(val, 'test');
                test.equals(arguments.length, 1);
                console.error = function(val){
                    test.equals(val, 'error');
                    console[name] = _console_fn;
                    console.error = _error;
                    test.done();
                };
                async[name](fn_err, 'one');
            };
            async[name](fn, 'one');
        };

        exports[name + ' with multiple result params'] = function(test){
            test.expect(1);
            var fn = function(callback){callback(null,'one','two','three');};
            var _console_fn = console[name];
            var called_with = [];
            console[name] = function(x){
                called_with.push(x);
            };
            async[name](fn);
            test.same(called_with, ['one','two','three']);
            console[name] = _console_fn;
            test.done();
        };
    }

    // browser-only test
    exports[name + ' without console.' + name] = function(test){
        if (typeof window !== 'undefined') {
            var _console = window.console;
            window.console = undefined;
            var fn = function(callback){callback(null, 'val');};
            var fn_err = function(callback){callback('error');};
            async[name](fn);
            async[name](fn_err);
            window.console = _console;
        }
        test.done();
    };

};

console_fn_tests('log');
console_fn_tests('dir');
/*console_fn_tests('info');
console_fn_tests('warn');
console_fn_tests('error');*/


exports['concat'] = function(test){
    test.expect(3);
    var call_order = [];
    var iteratee = function (x, cb) {
        setTimeout(function(){
            call_order.push(x);
            var r = [];
            while (x > 0) {
                r.push(x);
                x--;
            }
            cb(null, r);
        }, x*25);
    };
    async.concat([1,3,2], iteratee, function(err, results){
        test.same(results, [1,2,1,3,2,1]);
        test.same(call_order, [1,2,3]);
        test.ok(err === null, err + " passed instead of 'null'");
        test.done();
    });
};

exports['concat error'] = function(test){
    test.expect(1);
    var iteratee = function (x, cb) {
        cb(new Error('test error'));
    };
    async.concat([1,2,3], iteratee, function(err){
        test.ok(err);
        test.done();
    });
};

exports['concatSeries'] = function(test){
    test.expect(3);
    var call_order = [];
    var iteratee = function (x, cb) {
        setTimeout(function(){
            call_order.push(x);
            var r = [];
            while (x > 0) {
                r.push(x);
                x--;
            }
            cb(null, r);
        }, x*25);
    };
    async.concatSeries([1,3,2], iteratee, function(err, results){
        test.same(results, [1,3,2,1,2,1]);
        test.same(call_order, [1,3,2]);
        test.ok(err === null, err + " passed instead of 'null'");
        test.done();
    });
};

exports['until'] = function (test) {
    test.expect(4);

    var call_order = [];
    var count = 0;
    async.until(
        function () {
            call_order.push(['test', count]);
            return (count == 5);
        },
        function (cb) {
            call_order.push(['iteratee', count]);
            count++;
            cb(null, count);
        },
        function (err, result) {
            test.ok(err === null, err + " passed instead of 'null'");
            test.equals(result, 5, 'last result passed through');
            test.same(call_order, [
                ['test', 0],
                ['iteratee', 0], ['test', 1],
                ['iteratee', 1], ['test', 2],
                ['iteratee', 2], ['test', 3],
                ['iteratee', 3], ['test', 4],
                ['iteratee', 4], ['test', 5],
            ]);
            test.equals(count, 5);
            test.done();
        }
    );
};

exports['doUntil'] = function (test) {
    test.expect(4);

    var call_order = [];
    var count = 0;
    async.doUntil(
        function (cb) {
            call_order.push(['iteratee', count]);
            count++;
            cb(null, count);
        },
        function () {
            call_order.push(['test', count]);
            return (count == 5);
        },
        function (err, result) {
            test.ok(err === null, err + " passed instead of 'null'");
            test.equals(result, 5, 'last result passed through');
            test.same(call_order, [
                ['iteratee', 0], ['test', 1],
                ['iteratee', 1], ['test', 2],
                ['iteratee', 2], ['test', 3],
                ['iteratee', 3], ['test', 4],
                ['iteratee', 4], ['test', 5]
            ]);
            test.equals(count, 5);
            test.done();
        }
    );
};

exports['doUntil callback params'] = function (test) {
    test.expect(3);

    var call_order = [];
    var count = 0;
    async.doUntil(
        function (cb) {
            call_order.push(['iteratee', count]);
            count++;
            cb(null, count);
        },
        function (c) {
            call_order.push(['test', c]);
            return (c == 5);
        },
        function (err, result) {
            if (err) throw err;
            test.equals(result, 5, 'last result passed through');
            test.same(call_order, [
                ['iteratee', 0], ['test', 1],
                ['iteratee', 1], ['test', 2],
                ['iteratee', 2], ['test', 3],
                ['iteratee', 3], ['test', 4],
                ['iteratee', 4], ['test', 5]
            ]);
            test.equals(count, 5);
            test.done();
        }
    );
};

exports['whilst'] = function (test) {
    test.expect(4);

    var call_order = [];

    var count = 0;
    async.whilst(
        function () {
            call_order.push(['test', count]);
            return (count < 5);
        },
        function (cb) {
            call_order.push(['iteratee', count]);
            count++;
            cb(null, count);
        },
        function (err, result) {
            test.ok(err === null, err + " passed instead of 'null'");
            test.equals(result, 5, 'last result passed through');
            test.same(call_order, [
                ['test', 0],
                ['iteratee', 0], ['test', 1],
                ['iteratee', 1], ['test', 2],
                ['iteratee', 2], ['test', 3],
                ['iteratee', 3], ['test', 4],
                ['iteratee', 4], ['test', 5],
            ]);
            test.equals(count, 5);
            test.done();
        }
    );
};

exports['doWhilst'] = function (test) {
    test.expect(4);
    var call_order = [];

    var count = 0;
    async.doWhilst(
        function (cb) {
            call_order.push(['iteratee', count]);
            count++;
            cb(null, count);
        },
        function () {
            call_order.push(['test', count]);
            return (count < 5);
        },
        function (err, result) {
            test.ok(err === null, err + " passed instead of 'null'");
            test.equals(result, 5, 'last result passed through');
            test.same(call_order, [
                ['iteratee', 0], ['test', 1],
                ['iteratee', 1], ['test', 2],
                ['iteratee', 2], ['test', 3],
                ['iteratee', 3], ['test', 4],
                ['iteratee', 4], ['test', 5]
            ]);
            test.equals(count, 5);
            test.done();
        }
    );
};

exports['doWhilst callback params'] = function (test) {
    test.expect(3);
    var call_order = [];
    var count = 0;
    async.doWhilst(
        function (cb) {
            call_order.push(['iteratee', count]);
            count++;
            cb(null, count);
        },
        function (c) {
            call_order.push(['test', c]);
            return (c < 5);
        },
        function (err, result) {
            if (err) throw err;
            test.equals(result, 5, 'last result passed through');
            test.same(call_order, [
                ['iteratee', 0], ['test', 1],
                ['iteratee', 1], ['test', 2],
                ['iteratee', 2], ['test', 3],
                ['iteratee', 3], ['test', 4],
                ['iteratee', 4], ['test', 5]
            ]);
            test.equals(count, 5);
            test.done();
        }
    );
};

exports['doWhilst - error'] = function (test) {
    test.expect(1);
    var error = new Error('asdas');

    async.doWhilst(
        function (cb) {
            cb(error);
        },
        function () {},
        function (err) {
            test.equal(err, error);
            test.done();
        }
    );
};

exports['during'] = function (test) {
    var call_order = [];

    var count = 0;
    async.during(
        function (cb) {
            call_order.push(['test', count]);
            cb(null, count < 5);
        },
        function (cb) {
            call_order.push(['iteratee', count]);
            count++;
            cb();
        },
        function (err) {
            test.ok(err === null, err + " passed instead of 'null'");
            test.same(call_order, [
                ['test', 0],
                ['iteratee', 0], ['test', 1],
                ['iteratee', 1], ['test', 2],
                ['iteratee', 2], ['test', 3],
                ['iteratee', 3], ['test', 4],
                ['iteratee', 4], ['test', 5],
            ]);
            test.equals(count, 5);
            test.done();
        }
    );
};

exports['doDuring'] = function (test) {
    var call_order = [];

    var count = 0;
    async.doDuring(
        function (cb) {
            call_order.push(['iteratee', count]);
            count++;
            cb();
        },
        function (cb) {
            call_order.push(['test', count]);
            cb(null, count < 5);
        },
        function (err) {
            test.ok(err === null, err + " passed instead of 'null'");
            test.same(call_order, [
                ['iteratee', 0], ['test', 1],
                ['iteratee', 1], ['test', 2],
                ['iteratee', 2], ['test', 3],
                ['iteratee', 3], ['test', 4],
                ['iteratee', 4], ['test', 5],
            ]);
            test.equals(count, 5);
            test.done();
        }
    );
};

exports['doDuring - error test'] = function (test) {
    test.expect(1);
    var error = new Error('asdas');

    async.doDuring(
        function (cb) {
            cb(error);
        },
        function () {},
        function (err) {
            test.equal(err, error);
            test.done();
        }
    );
};

exports['doDuring - error iteratee'] = function (test) {
    test.expect(1);
    var error = new Error('asdas');

    async.doDuring(
        function (cb) {
            cb(null);
        },
        function (cb) {
            cb(error);
        },
        function (err) {
            test.equal(err, error);
            test.done();
        }
    );
};

exports['whilst optional callback'] = function (test) {
    var counter = 0;
    async.whilst(
        function () { return counter < 2; },
        function (cb) {
            counter++;
            cb();
        }
    );
    test.equal(counter, 2);
    test.done();
};

exports['ensureAsync'] = {
    'defer sync functions': function (test) {
        test.expect(6);
        var sync = true;
        async.ensureAsync(function (arg1, arg2, cb) {
            test.equal(arg1, 1);
            test.equal(arg2, 2);
            cb(null, 4, 5);
        })(1, 2, function (err, arg4, arg5) {
            test.equal(err, null);
            test.equal(arg4, 4);
            test.equal(arg5, 5);
            test.ok(!sync, 'callback called on same tick');
            test.done();
        });
        sync = false;
    },

    'do not defer async functions': function (test) {
        test.expect(6);
        var sync = false;
        async.ensureAsync(function (arg1, arg2, cb) {
            test.equal(arg1, 1);
            test.equal(arg2, 2);
            async.setImmediate(function () {
                sync = true;
                cb(null, 4, 5);
                sync = false;
            });
        })(1, 2, function (err, arg4, arg5) {
            test.equal(err, null);
            test.equal(arg4, 4);
            test.equal(arg5, 5);
            test.ok(sync, 'callback called on next tick');
            test.done();
        });
    },

    'double wrapping': function (test) {
        test.expect(6);
        var sync = true;
        async.ensureAsync(async.ensureAsync(function (arg1, arg2, cb) {
            test.equal(arg1, 1);
            test.equal(arg2, 2);
            cb(null, 4, 5);
        }))(1, 2, function (err, arg4, arg5) {
            test.equal(err, null);
            test.equal(arg4, 4);
            test.equal(arg5, 5);
            test.ok(!sync, 'callback called on same tick');
            test.done();
        });
        sync = false;
    }
};

exports['constant'] = function (test) {
    test.expect(5);
    var f = async.constant(42, 1, 2, 3);
    f(function (err, value, a, b, c) {
        test.ok(!err);
        test.ok(value === 42);
        test.ok(a === 1);
        test.ok(b === 2);
        test.ok(c === 3);
        test.done();
    });
};
