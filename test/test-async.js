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

function eachIteratee(args, x, callback) {
    setTimeout(function(){
        args.push(x);
        callback();
    }, x*25);
}

function forEachOfIteratee(args, value, key, callback) {
    setTimeout(function(){
        args.push(key, value);
        callback();
    }, value*25);
}

function mapIteratee(call_order, x, callback) {
    setTimeout(function(){
        call_order.push(x);
        callback(null, x*2);
    }, x*25);
}

function eachNoCallbackIteratee(test, x, callback) {
    test.equal(x, 1);
    callback();
    test.done();
}

function forEachOfNoCallbackIteratee(test, x, key, callback) {
    test.equal(x, 1);
    test.equal(key, "a");
    callback();
    test.done();
}

function getFunctionsObject(call_order) {
    return {
        one: function(callback){
            setTimeout(function(){
                call_order.push(1);
                callback(null, 1);
            }, 125);
        },
        two: function(callback){
            setTimeout(function(){
                call_order.push(2);
                callback(null, 2);
            }, 200);
        },
        three: function(callback){
            setTimeout(function(){
                call_order.push(3);
                callback(null, 3,3);
            }, 50);
        }
    };
}

function isBrowser() {
    return (typeof process === "undefined") ||
        (process + "" !== "[object process]"); // browserify
}


exports['seq'] = function (test) {
    test.expect(5);
    var add2 = function (n, cb) {
        test.equal(n, 3);
        setTimeout(function () {
            cb(null, n + 2);
        }, 50);
    };
    var mul3 = function (n, cb) {
        test.equal(n, 5);
        setTimeout(function () {
            cb(null, n * 3);
        }, 15);
    };
    var add1 = function (n, cb) {
        test.equal(n, 15);
        setTimeout(function () {
            cb(null, n + 1);
        }, 100);
    };
    var add2mul3add1 = async.seq(add2, mul3, add1);
    add2mul3add1(3, function (err, result) {
        if (err) {
            return test.done(err);
        }
        test.ok(err === null, err + " passed instead of 'null'");
        test.equal(result, 16);
        test.done();
    });
};

exports['seq error'] = function (test) {
    test.expect(3);
    var testerr = new Error('test');

    var add2 = function (n, cb) {
        test.equal(n, 3);
        setTimeout(function () {
            cb(null, n + 2);
        }, 50);
    };
    var mul3 = function (n, cb) {
        test.equal(n, 5);
        setTimeout(function () {
            cb(testerr);
        }, 15);
    };
    var add1 = function (n, cb) {
        test.ok(false, 'add1 should not get called');
        setTimeout(function () {
            cb(null, n + 1);
        }, 100);
    };
    var add2mul3add1 = async.seq(add2, mul3, add1);
    add2mul3add1(3, function (err) {
        test.equal(err, testerr);
        test.done();
    });
};

exports['seq binding'] = function (test) {
    test.expect(4);
    var testcontext = {name: 'foo'};

    var add2 = function (n, cb) {
        test.equal(this, testcontext);
        setTimeout(function () {
            cb(null, n + 2);
        }, 50);
    };
    var mul3 = function (n, cb) {
        test.equal(this, testcontext);
        setTimeout(function () {
            cb(null, n * 3);
        }, 15);
    };
    var add2mul3 = async.seq(add2, mul3);
    add2mul3.call(testcontext, 3, function (err, result) {
        if (err) {
            return test.done(err);
        }
        test.equal(this, testcontext);
        test.equal(result, 15);
        test.done();
    });
};

exports['seq without callback'] = function (test) {
    test.expect(2);
    var testcontext = {name: 'foo'};

    var add2 = function (n, cb) {
        test.equal(this, testcontext);
        setTimeout(function () {
            cb(null, n + 2);
        }, 50);
    };
    var mul3 = function () {
        test.equal(this, testcontext);
        setTimeout(function () {
            test.done();
        }, 15);
    };
    var add2mul3 = async.seq(add2, mul3);
    add2mul3.call(testcontext, 3);
};


exports['parallel'] = function(test){
    var call_order = [];
    async.parallel([
        function(callback){
            setTimeout(function(){
                call_order.push(1);
                callback(null, 1);
            }, 50);
        },
        function(callback){
            setTimeout(function(){
                call_order.push(2);
                callback(null, 2);
            }, 100);
        },
        function(callback){
            setTimeout(function(){
                call_order.push(3);
                callback(null, 3,3);
            }, 25);
        }
    ],
    function(err, results){
        test.ok(err === null, err + " passed instead of 'null'");
        test.same(call_order, [3,1,2]);
        test.same(results, [1,2,[3,3]]);
        test.done();
    });
};

exports['parallel empty array'] = function(test){
    async.parallel([], function(err, results){
        test.ok(err === null, err + " passed instead of 'null'");
        test.same(results, []);
        test.done();
    });
};

exports['parallel error'] = function(test){
    async.parallel([
        function(callback){
            callback('error', 1);
        },
        function(callback){
            callback('error2', 2);
        }
    ],
    function(err){
        test.equals(err, 'error');
    });
    setTimeout(test.done, 100);
};

exports['parallel no callback'] = function(test){
    async.parallel([
        function(callback){callback();},
        function(callback){callback(); test.done();},
    ]);
};

exports['parallel object'] = function(test){
    var call_order = [];
    async.parallel(getFunctionsObject(call_order), function(err, results){
        test.equals(err, null);
        test.same(call_order, [3,1,2]);
        test.same(results, {
            one: 1,
            two: 2,
            three: [3,3]
        });
        test.done();
    });
};

// Issue 10 on github: https://github.com/caolan/async/issues#issue/10
exports['paralel falsy return values'] = function (test) {
    function taskFalse(callback) {
        async.nextTick(function() {
            callback(null, false);
        });
    }
    function taskUndefined(callback) {
        async.nextTick(function() {
            callback(null, undefined);
        });
    }
    function taskEmpty(callback) {
        async.nextTick(function() {
            callback(null);
        });
    }
    function taskNull(callback) {
        async.nextTick(function() {
            callback(null, null);
        });
    }
    async.parallel(
        [taskFalse, taskUndefined, taskEmpty, taskNull],
        function(err, results) {
            test.equal(results.length, 4);
            test.strictEqual(results[0], false);
            test.strictEqual(results[1], undefined);
            test.strictEqual(results[2], undefined);
            test.strictEqual(results[3], null);
            test.done();
        }
    );
};


exports['parallel limit'] = function(test){
    var call_order = [];
    async.parallelLimit([
        function(callback){
            setTimeout(function(){
                call_order.push(1);
                callback(null, 1);
            }, 50);
        },
        function(callback){
            setTimeout(function(){
                call_order.push(2);
                callback(null, 2);
            }, 100);
        },
        function(callback){
            setTimeout(function(){
                call_order.push(3);
                callback(null, 3,3);
            }, 25);
        }
    ],
    2,
    function(err, results){
        test.ok(err === null, err + " passed instead of 'null'");
        test.same(call_order, [1,3,2]);
        test.same(results, [1,2,[3,3]]);
        test.done();
    });
};

exports['parallel limit empty array'] = function(test){
    async.parallelLimit([], 2, function(err, results){
        test.ok(err === null, err + " passed instead of 'null'");
        test.same(results, []);
        test.done();
    });
};

exports['parallel limit error'] = function(test){
    async.parallelLimit([
        function(callback){
            callback('error', 1);
        },
        function(callback){
            callback('error2', 2);
        }
    ],
    1,
    function(err){
        test.equals(err, 'error');
    });
    setTimeout(test.done, 100);
};

exports['parallel limit no callback'] = function(test){
    async.parallelLimit([
        function(callback){callback();},
        function(callback){callback(); test.done();},
    ], 1);
};

exports['parallel limit object'] = function(test){
    var call_order = [];
    async.parallelLimit(getFunctionsObject(call_order), 2, function(err, results){
        test.equals(err, null);
        test.same(call_order, [1,3,2]);
        test.same(results, {
            one: 1,
            two: 2,
            three: [3,3]
        });
        test.done();
    });
};

exports['parallel call in another context'] = function(test) {
    if (isBrowser()) {
        // node only test
        test.done();
        return;
    }
    var vm = require('vm');
    var sandbox = {
        async: async,
        test: test
    };

    var fn = "(" + (function () {
        async.parallel([function (callback) {
            callback();
        }], function (err) {
            if (err) {
                return test.done(err);
            }
            test.done();
        });
    }).toString() + "())";

    vm.runInNewContext(fn, sandbox);
};

exports['parallel error with reflect'] = function(test){
    async.parallel([
        async.reflect(function(callback){
            callback('error', 1);
        }),
        async.reflect(function(callback){
            callback('error2', 2);
        }),
        async.reflect(function(callback){
            callback(null, 2);
        })
    ],
    function(err, results){
        test.ok(err === null, err + " passed instead of 'null'");
        test.same(results, [
            { error: 'error' },
            { error: 'error2' },
            { value: 2 }
        ]);
        test.done();
    });
};

exports['parallel does not continue replenishing after error'] = function (test) {
    var started = 0;
    var arr = [
        funcToCall,
        funcToCall,
        funcToCall,
        funcToCall,
        funcToCall,
        funcToCall,
        funcToCall,
        funcToCall,
        funcToCall,
    ];
    var delay = 10;
    var limit = 3;
    var maxTime = 10 * arr.length;
    function funcToCall(callback) {
        started ++;
        if (started === 3) {
            return callback(new Error ("Test Error"));
        }
        setTimeout(function(){
            callback();
        }, delay);
    }

    async.parallelLimit(arr, limit, function(){});

    setTimeout(function(){
        test.equal(started, 3);
        test.done();
    }, maxTime);
};


exports['series'] = {

    'series': function(test){
    var call_order = [];
    async.series([
        function(callback){
            setTimeout(function(){
                call_order.push(1);
                callback(null, 1);
            }, 25);
        },
        function(callback){
            setTimeout(function(){
                call_order.push(2);
                callback(null, 2);
            }, 50);
        },
        function(callback){
            setTimeout(function(){
                call_order.push(3);
                callback(null, 3,3);
            }, 15);
        }
    ],
    function(err, results){
        test.ok(err === null, err + " passed instead of 'null'");
        test.same(results, [1,2,[3,3]]);
        test.same(call_order, [1,2,3]);
        test.done();
    });
},

    'with reflect': function(test){
    var call_order = [];
    async.series([
        async.reflect(function(callback){
            setTimeout(function(){
                call_order.push(1);
                callback(null, 1);
            }, 25);
        }),
        async.reflect(function(callback){
            setTimeout(function(){
                call_order.push(2);
                callback(null, 2);
            }, 50);
        }),
        async.reflect(function(callback){
            setTimeout(function(){
                call_order.push(3);
                callback(null, 3,3);
            }, 15);
        })
    ],
    function(err, results){
        test.ok(err === null, err + " passed instead of 'null'");
        test.deepEqual(results, [
            { value: 1 },
            { value: 2 },
            { value: [3,3] }
        ]);
        test.same(call_order, [1,2,3]);
        test.done();
    });
},

    'empty array': function(test){
    async.series([], function(err, results){
        test.equals(err, null);
        test.same(results, []);
        test.done();
    });
},

    'error': function(test){
    test.expect(1);
    async.series([
        function(callback){
            callback('error', 1);
        },
        function(callback){
            test.ok(false, 'should not be called');
            callback('error2', 2);
        }
    ],
    function(err){
        test.equals(err, 'error');
    });
    setTimeout(test.done, 100);
},

    'error with reflect': function(test){
    test.expect(2);
    async.series([
        async.reflect(function(callback){
            callback('error', 1);
        }),
        async.reflect(function(callback){
            callback('error2', 2);
        }),
        async.reflect(function(callback){
            callback(null, 1);
        })
    ],
    function(err, results){
        test.ok(err === null, err + " passed instead of 'null'");
        test.deepEqual(results, [
            { error: 'error' },
            { error: 'error2' },
            { value: 1 }
        ]);
        test.done();
    });
},

    'no callback': function(test){
    async.series([
        function(callback){callback();},
        function(callback){callback(); test.done();},
    ]);
},

    'object': function(test){
    var call_order = [];
    async.series(getFunctionsObject(call_order), function(err, results){
        test.equals(err, null);
        test.same(results, {
            one: 1,
            two: 2,
            three: [3,3]
        });
        test.same(call_order, [1,2,3]);
        test.done();
    });
},

    'call in another context': function(test) {
    if (isBrowser()) {
        // node only test
        test.done();
        return;
    }
    var vm = require('vm');
    var sandbox = {
        async: async,
        test: test
    };

    var fn = "(" + (function () {
        async.series([function (callback) {
            callback();
        }], function (err) {
            if (err) {
                return test.done(err);
            }
            test.done();
        });
    }).toString() + "())";

    vm.runInNewContext(fn, sandbox);
},

    // Issue 10 on github: https://github.com/caolan/async/issues#issue/10
    'falsy return values': function (test) {
    function taskFalse(callback) {
        async.nextTick(function() {
            callback(null, false);
        });
    }
    function taskUndefined(callback) {
        async.nextTick(function() {
            callback(null, undefined);
        });
    }
    function taskEmpty(callback) {
        async.nextTick(function() {
            callback(null);
        });
    }
    function taskNull(callback) {
        async.nextTick(function() {
            callback(null, null);
        });
    }
    async.series(
        [taskFalse, taskUndefined, taskEmpty, taskNull],
        function(err, results) {
            test.equal(results.length, 4);
            test.strictEqual(results[0], false);
            test.strictEqual(results[1], undefined);
            test.strictEqual(results[2], undefined);
            test.strictEqual(results[3], null);
            test.done();
        }
    );
}

};


exports['iterator'] = function(test){
    var call_order = [];
    var iterator = async.iterator([
        function(){call_order.push(1);},
        function(arg1){
            test.equals(arg1, 'arg1');
            call_order.push(2);
        },
        function(arg1, arg2){
            test.equals(arg1, 'arg1');
            test.equals(arg2, 'arg2');
            call_order.push(3);
        }
    ]);
    iterator();
    test.same(call_order, [1]);
    var iterator2 = iterator();
    test.same(call_order, [1,1]);
    var iterator3 = iterator2('arg1');
    test.same(call_order, [1,1,2]);
    var iterator4 = iterator3('arg1', 'arg2');
    test.same(call_order, [1,1,2,3]);
    test.equals(iterator4, undefined);
    test.done();
};

exports['iterator empty array'] = function(test){
    var iterator = async.iterator([]);
    test.equals(iterator(), undefined);
    test.equals(iterator.next(), undefined);
    test.done();
};

exports['iterator.next'] = function(test){
    var call_order = [];
    var iterator = async.iterator([
        function(){call_order.push(1);},
        function(arg1){
            test.equals(arg1, 'arg1');
            call_order.push(2);
        },
        function(arg1, arg2){
            test.equals(arg1, 'arg1');
            test.equals(arg2, 'arg2');
            call_order.push(3);
        }
    ]);
    var fn = iterator.next();
    var iterator2 = fn('arg1');
    test.same(call_order, [2]);
    iterator2('arg1','arg2');
    test.same(call_order, [2,3]);
    test.equals(iterator2.next(), undefined);
    test.done();
};

exports['each'] = function(test){
    var args = [];
    async.each([1,3,2], eachIteratee.bind(this, args), function(err){
        test.ok(err === null, err + " passed instead of 'null'");
        test.same(args, [1,2,3]);
        test.done();
    });
};

exports['each extra callback'] = function(test){
    var count = 0;
    async.each([1,3,2], function(val, callback) {
        count++;
        var done = count == 3;
        callback();
        test.throws(callback);
        if (done) {
            test.done();
        }
    });
};

exports['each empty array'] = function(test){
    test.expect(1);
    async.each([], function(x, callback){
        test.ok(false, 'iteratee should not be called');
        callback();
    }, function(err){
        if (err) throw err;
        test.ok(true, 'should call callback');
    });
    setTimeout(test.done, 25);
};


exports['each empty array, with other property on the array'] = function(test){
    test.expect(1);
    var myArray = [];
    myArray.myProp = "anything";
    async.each(myArray, function(x, callback){
        test.ok(false, 'iteratee should not be called');
        callback();
    }, function(err){
        if (err) throw err;
        test.ok(true, 'should call callback');
    });
    setTimeout(test.done, 25);
};


exports['each error'] = function(test){
    test.expect(1);
    async.each([1,2,3], function(x, callback){
        callback('error');
    }, function(err){
        test.equals(err, 'error');
    });
    setTimeout(test.done, 50);
};

exports['each no callback'] = function(test){
    async.each([1], eachNoCallbackIteratee.bind(this, test));
};

exports['forEach alias'] = function (test) {
    test.strictEqual(async.each, async.forEach);
    test.done();
};

exports['forEachOf'] = function(test){
    var args = [];
    async.forEachOf({ a: 1, b: 2 }, forEachOfIteratee.bind(this, args), function(err){
        test.ok(err === null, err + " passed instead of 'null'");
        test.same(args, ["a", 1, "b", 2]);
        test.done();
    });
};

exports['forEachOf - instant resolver'] = function(test){
    test.expect(1);
    var args = [];
    async.forEachOf({ a: 1, b: 2 }, function(x, k, cb) {
        args.push(k, x);
        cb();
    }, function(){
        // ensures done callback isn't called before all items iterated
        test.same(args, ["a", 1, "b", 2]);
        test.done();
    });
};

exports['forEachOf empty object'] = function(test){
    test.expect(1);
    async.forEachOf({}, function(value, key, callback){
        test.ok(false, 'iteratee should not be called');
        callback();
    }, function(err) {
        if (err) throw err;
        test.ok(true, 'should call callback');
    });
    setTimeout(test.done, 25);
};

exports['forEachOf empty array'] = function(test){
    test.expect(1);
    async.forEachOf([], function(value, key, callback){
        test.ok(false, 'iteratee should not be called');
        callback();
    }, function(err) {
        if (err) throw err;
        test.ok(true, 'should call callback');
    });
    setTimeout(test.done, 25);
};

exports['forEachOf error'] = function(test){
    test.expect(1);
    async.forEachOf({ a: 1, b: 2 }, function(value, key, callback) {
        callback('error');
    }, function(err){
        test.equals(err, 'error');
    });
    setTimeout(test.done, 50);
};

exports['forEachOf no callback'] = function(test){
    async.forEachOf({ a: 1 }, forEachOfNoCallbackIteratee.bind(this, test));
};

exports['eachOf alias'] = function(test){
    test.equals(async.eachOf, async.forEachOf);
    test.done();
};

exports['forEachOf with array'] = function(test){
    var args = [];
    async.forEachOf([ "a", "b" ], forEachOfIteratee.bind(this, args), function(err){
        if (err) throw err;
        test.same(args, [0, "a", 1, "b"]);
        test.done();
    });
};

exports['forEachOf with Set (iterators)'] = function(test){
    if (typeof Set !== 'function')
        return test.done();

    var args = [];
    var set = new Set();
    set.add("a");
    set.add("b");
    async.forEachOf(set, forEachOfIteratee.bind(this, args), function(err){
        if (err) throw err;
        test.same(args, [0, "a", 1, "b"]);
        test.done();
    });
};

exports['forEachOf with Map (iterators)'] = function(test){
    if (typeof Map !== 'function')
        return test.done();

    var args = [];
    var map = new Map();
    map.set(1, "a");
    map.set(2, "b");
    async.forEachOf(map, forEachOfIteratee.bind(this, args), function(err){
        if (err) throw err;
        test.same(args, [0, [1, "a"], 1, [2, "b"]]);
        test.done();
    });
};

exports['eachSeries'] = function(test){
    var args = [];
    async.eachSeries([1,3,2], eachIteratee.bind(this, args), function(err){
        test.ok(err === null, err + " passed instead of 'null'");
        test.same(args, [1,3,2]);
        test.done();
    });
};

exports['eachSeries empty array'] = function(test){
    test.expect(1);
    async.eachSeries([], function(x, callback){
        test.ok(false, 'iteratee should not be called');
        callback();
    }, function(err){
        if (err) throw err;
        test.ok(true, 'should call callback');
    });
    setTimeout(test.done, 25);
};

exports['eachSeries array modification'] = function(test) {
    test.expect(1);
    var arr = [1, 2, 3, 4];
    async.eachSeries(arr, function (x, callback) {
        async.setImmediate(callback);
    }, function () {
        test.ok(true, 'should call callback');
    });

    arr.pop();
    arr.splice(0, 1);

    setTimeout(test.done, 50);
};

// bug #782.  Remove in next major release
exports['eachSeries single item'] = function (test) {
    test.expect(1);
    var sync = true;
    async.eachSeries([1], function (i, cb) {
        cb(null);
    }, function () {
        test.ok(sync, "callback not called on same tick");
    });
    sync = false;
    test.done();
};

// bug #782.  Remove in next major release
exports['eachSeries single item'] = function (test) {
    test.expect(1);
    var sync = true;
    async.eachSeries([1], function (i, cb) {
        cb(null);
    }, function () {
        test.ok(sync, "callback not called on same tick");
    });
    sync = false;
    test.done();
};

exports['eachSeries error'] = function(test){
    test.expect(2);
    var call_order = [];
    async.eachSeries([1,2,3], function(x, callback){
        call_order.push(x);
        callback('error');
    }, function(err){
        test.same(call_order, [1]);
        test.equals(err, 'error');
    });
    setTimeout(test.done, 50);
};

exports['eachSeries no callback'] = function(test){
    async.eachSeries([1], eachNoCallbackIteratee.bind(this, test));
};


exports['eachLimit'] = function(test){
    var args = [];
    var arr = [0,1,2,3,4,5,6,7,8,9];
    async.eachLimit(arr, 2, function(x,callback){
        setTimeout(function(){
            args.push(x);
            callback();
        }, x*5);
    }, function(err){
        test.ok(err === null, err + " passed instead of 'null'");
        test.same(args, arr);
        test.done();
    });
};

exports['eachLimit empty array'] = function(test){
    test.expect(1);
    async.eachLimit([], 2, function(x, callback){
        test.ok(false, 'iteratee should not be called');
        callback();
    }, function(err){
        if (err) throw err;
        test.ok(true, 'should call callback');
    });
    setTimeout(test.done, 25);
};

exports['eachLimit limit exceeds size'] = function(test){
    var args = [];
    var arr = [0,1,2,3,4,5,6,7,8,9];
    async.eachLimit(arr, 20, eachIteratee.bind(this, args), function(err){
        if (err) throw err;
        test.same(args, arr);
        test.done();
    });
};

exports['eachLimit limit equal size'] = function(test){
    var args = [];
    var arr = [0,1,2,3,4,5,6,7,8,9];
    async.eachLimit(arr, 10, eachIteratee.bind(this, args), function(err){
        if (err) throw err;
        test.same(args, arr);
        test.done();
    });
};

exports['eachLimit zero limit'] = function(test){
    test.expect(1);
    async.eachLimit([0,1,2,3,4,5], 0, function(x, callback){
        test.ok(false, 'iteratee should not be called');
        callback();
    }, function(err){
        if (err) throw err;
        test.ok(true, 'should call callback');
    });
    setTimeout(test.done, 25);
};

exports['eachLimit error'] = function(test){
    test.expect(2);
    var arr = [0,1,2,3,4,5,6,7,8,9];
    var call_order = [];

    async.eachLimit(arr, 3, function(x, callback){
        call_order.push(x);
        if (x === 2) {
            callback('error');
        }
    }, function(err){
        test.same(call_order, [0,1,2]);
        test.equals(err, 'error');
    });
    setTimeout(test.done, 25);
};

exports['eachLimit no callback'] = function(test){
    async.eachLimit([1], 1, eachNoCallbackIteratee.bind(this, test));
};

exports['eachLimit synchronous'] = function(test){
    var args = [];
    var arr = [0,1,2];
    async.eachLimit(arr, 5, function(x,callback){
        args.push(x);
        callback();
    }, function(err){
        if (err) throw err;
        test.same(args, arr);
        test.done();
    });
};


exports['eachLimit does not continue replenishing after error'] = function (test) {
    var started = 0;
    var arr = [0,1,2,3,4,5,6,7,8,9];
    var delay = 10;
    var limit = 3;
    var maxTime = 10 * arr.length;

    async.eachLimit(arr, limit, function(x, callback) {
        started ++;
        if (started === 3) {
            return callback(new Error ("Test Error"));
        }
        setTimeout(function(){
            callback();
        }, delay);
    }, function(){});

    setTimeout(function(){
        test.equal(started, 3);
        test.done();
    }, maxTime);
};

exports['forEachSeries alias'] = function (test) {
    test.strictEqual(async.eachSeries, async.forEachSeries);
    test.done();
};

exports['forEachOfSeries'] = function(test){
    var args = [];
    async.forEachOfSeries({ a: 1, b: 2 }, forEachOfIteratee.bind(this, args), function(err){
        test.ok(err === null, err + " passed instead of 'null'");
        test.same(args, [ "a", 1, "b", 2 ]);
        test.done();
    });
};

exports['forEachOfSeries empty object'] = function(test){
    test.expect(1);
    async.forEachOfSeries({}, function(x, callback){
        test.ok(false, 'iteratee should not be called');
        callback();
    }, function(err){
        if (err) throw err;
        test.ok(true, 'should call callback');
    });
    setTimeout(test.done, 25);
};

exports['forEachOfSeries error'] = function(test){
    test.expect(2);
    var call_order = [];
    async.forEachOfSeries({ a: 1, b: 2 }, function(value, key, callback){
        call_order.push(value, key);
        callback('error');
    }, function(err){
        test.same(call_order, [ 1, "a" ]);
        test.equals(err, 'error');
    });
    setTimeout(test.done, 50);
};

exports['forEachOfSeries no callback'] = function(test){
    async.forEachOfSeries({ a: 1 }, forEachOfNoCallbackIteratee.bind(this, test));
};

exports['forEachOfSeries with array'] = function(test){
    var args = [];
    async.forEachOfSeries([ "a", "b" ], forEachOfIteratee.bind(this, args), function(err){
        if (err) throw err;
        test.same(args, [ 0, "a", 1, "b" ]);
        test.done();
    });
};

exports['forEachOfSeries with Set (iterators)'] = function(test){
    if (typeof Set !== 'function')
        return test.done();

    var args = [];
    var set = new Set();
    set.add("a");
    set.add("b");
    async.forEachOfSeries(set, forEachOfIteratee.bind(this, args), function(err){
        if (err) throw err;
        test.same(args, [0, "a", 1, "b"]);
        test.done();
    });
};

exports['forEachOfSeries with Map (iterators)'] = function(test){
    if (typeof Map !== 'function')
        return test.done();

    var args = [];
    var map = new Map();
    map.set(1, "a");
    map.set(2, "b");
    async.forEachOfSeries(map, forEachOfIteratee.bind(this, args), function(err){
        if (err) throw err;
        test.same(args, [0, [1, "a"], 1, [2, "b"]]);
        test.done();
    });
};

exports['eachOfLimit alias'] = function(test){
    test.equals(async.eachOfLimit, async.forEachOfLimit);
    test.done();
};


exports['eachOfSeries alias'] = function(test){
    test.equals(async.eachOfSeries, async.forEachOfSeries);
    test.done();
};

exports['forEachLimit alias'] = function (test) {
    test.strictEqual(async.eachLimit, async.forEachLimit);
    test.done();
};

exports['forEachOfLimit'] = function(test){
    var args = [];
    var obj = { a: 1, b: 2, c: 3, d: 4 };
    async.forEachOfLimit(obj, 2, function(value, key, callback){
        setTimeout(function(){
            args.push(value, key);
            callback();
        }, value * 5);
    }, function(err){
        test.ok(err === null, err + " passed instead of 'null'");
        test.same(args, [ 1, "a", 2, "b", 3, "c", 4, "d" ]);
        test.done();
    });
};

exports['forEachOfLimit empty object'] = function(test){
    test.expect(1);
    async.forEachOfLimit({}, 2, function(value, key, callback){
        test.ok(false, 'iteratee should not be called');
        callback();
    }, function(err){
        if (err) throw err;
        test.ok(true, 'should call callback');
    });
    setTimeout(test.done, 25);
};

exports['forEachOfLimit limit exceeds size'] = function(test){
    var args = [];
    var obj = { a: 1, b: 2, c: 3, d: 4, e: 5 };
    async.forEachOfLimit(obj, 10, forEachOfIteratee.bind(this, args), function(err){
        if (err) throw err;
        test.same(args, [ "a", 1, "b", 2, "c", 3, "d", 4, "e", 5 ]);
        test.done();
    });
};

exports['forEachOfLimit limit equal size'] = function(test){
    var args = [];
    var obj = { a: 1, b: 2, c: 3, d: 4, e: 5 };
    async.forEachOfLimit(obj, 5, forEachOfIteratee.bind(this, args), function(err){
        if (err) throw err;
        test.same(args, [ "a", 1, "b", 2, "c", 3, "d", 4, "e", 5 ]);
        test.done();
    });
};

exports['forEachOfLimit zero limit'] = function(test){
    test.expect(1);
    async.forEachOfLimit({ a: 1, b: 2 }, 0, function(x, callback){
        test.ok(false, 'iteratee should not be called');
        callback();
    }, function(err){
        if (err) throw err;
        test.ok(true, 'should call callback');
    });
    setTimeout(test.done, 25);
};

exports['forEachOfLimit error'] = function(test){
    test.expect(2);
    var obj = { a: 1, b: 2, c: 3, d: 4, e: 5 };
    var call_order = [];

    async.forEachOfLimit(obj, 3, function(value, key, callback){
        call_order.push(value, key);
        if (value === 2) {
            callback('error');
        }
    }, function(err){
        test.same(call_order, [ 1, "a", 2, "b" ]);
        test.equals(err, 'error');
    });
    setTimeout(test.done, 25);
};

exports['forEachOfLimit no callback'] = function(test){
    async.forEachOfLimit({ a: 1 }, 1, forEachOfNoCallbackIteratee.bind(this, test));
};

exports['forEachOfLimit synchronous'] = function(test){
    var args = [];
    var obj = { a: 1, b: 2 };
    async.forEachOfLimit(obj, 5, forEachOfIteratee.bind(this, args), function(err){
        if (err) throw err;
        test.same(args, [ "a", 1, "b", 2 ]);
        test.done();
    });
};

exports['forEachOfLimit with array'] = function(test){
    var args = [];
    var arr = [ "a", "b" ];
    async.forEachOfLimit(arr, 1, forEachOfIteratee.bind(this, args), function (err) {
        if (err) throw err;
        test.same(args, [ 0, "a", 1, "b" ]);
        test.done();
    });
};

exports['forEachOfLimit with Set (iterators)'] = function(test){
    if (typeof Set !== 'function')
        return test.done();

    var args = [];
    var set = new Set();
    set.add("a");
    set.add("b");
    async.forEachOfLimit(set, 1, forEachOfIteratee.bind(this, args), function(err){
        if (err) throw err;
        test.same(args, [0, "a", 1, "b"]);
        test.done();
    });
};

exports['forEachOfLimit with Map (iterators)'] = function(test){
    if (typeof Map !== 'function')
        return test.done();

    var args = [];
    var map = new Map();
    map.set(1, "a");
    map.set(2, "b");
    async.forEachOfLimit(map, 1, forEachOfIteratee.bind(this, args), function(err){
        if (err) throw err;
        test.same(args, [0, [1, "a"], 1, [2, "b"]]);
        test.done();
    });
};

exports['map'] = {

    'basic': function(test){
    var call_order = [];
    async.map([1,3,2], mapIteratee.bind(this, call_order), function(err, results){
        test.ok(err === null, err + " passed instead of 'null'");
        test.same(call_order, [1,2,3]);
        test.same(results, [2,6,4]);
        test.done();
    });
},

    'with reflect': function(test){
    var call_order = [];
    async.map([1,3,2], async.reflect(function(item, cb) {
        setTimeout(function(){
            call_order.push(item);
            cb(null, item*2);
        }, item*25);
    }), function(err, results){
        test.ok(err === null, err + " passed instead of 'null'");
        test.same(call_order, [1,2,3]);
        test.same(results, [
            { value: 2 },
            { value: 6 },
            { value: 4 }
        ]);
        test.done();
    });
},

    'error with reflect': function(test){
    var call_order = [];
    async.map([-1,1,3,2], async.reflect(function(item, cb) {
        setTimeout(function(){
            call_order.push(item);
            if (item < 0) {
                cb('number less then zero');
            } else {
                cb(null, item*2);
            }

        }, item*25);
    }), function(err, results){
        test.ok(err === null, err + " passed instead of 'null'");
        test.same(call_order, [-1,1,2,3]);
        test.same(results, [
            { error: 'number less then zero' },
            { value: 2 },
            { value: 6 },
            { value: 4 }
        ]);
        test.done();
    });
},

    'map original untouched': function(test){
    var a = [1,2,3];
    async.map(a, function(x, callback){
        callback(null, x*2);
    }, function(err, results){
        test.same(results, [2,4,6]);
        test.same(a, [1,2,3]);
        test.done();
    });
},

    'map without main callback': function(test){
    var a = [1,2,3];
    var r = [];
    async.map(a, function(x, callback){
        r.push(x);
        var done = r.length == a.length;
        callback(null);
        if (done) {
            test.same(r, a);
            test.done();
        }
    });
},

    'map error': function(test){
    test.expect(1);
    async.map([1,2,3], function(x, callback){
        callback('error');
    }, function(err){
        test.equals(err, 'error');
    });
    setTimeout(test.done, 50);
},

    'map undefined array': function(test){
    test.expect(2);
    async.map(undefined, function(x, callback){
        callback();
    }, function(err, result){
        test.equals(err, null);
        test.same(result, []);
    });
    setTimeout(test.done, 50);
},

    'map object': function (test) {
    async.map({a: 1, b: 2, c: 3}, function (val, callback) {
        callback(null, val * 2);
    }, function (err, result) {
        if (err) throw err;
        test.equals(Object.prototype.toString.call(result), '[object Object]');
        test.same(result, {a: 2, b: 4, c: 6});
        test.done();
    });
},

    'mapSeries': function(test){
    var call_order = [];
    async.mapSeries([1,3,2], mapIteratee.bind(this, call_order), function(err, results){
        test.ok(err === null, err + " passed instead of 'null'");
        test.same(call_order, [1,3,2]);
        test.same(results, [2,6,4]);
        test.done();
    });
},

    'mapSeries error': function(test){
    test.expect(1);
    async.mapSeries([1,2,3], function(x, callback){
        callback('error');
    }, function(err){
        test.equals(err, 'error');
    });
    setTimeout(test.done, 50);
},

    'mapSeries undefined array': function(test){
    test.expect(2);
    async.mapSeries(undefined, function(x, callback){
        callback();
    }, function(err, result){
        test.equals(err, null);
        test.same(result, []);
    });
    setTimeout(test.done, 50);
},

    'mapSeries object': function (test) {
    async.mapSeries({a: 1, b: 2, c: 3}, function (val, callback) {
        callback(null, val * 2);
    }, function (err, result) {
        if (err) throw err;
        test.same(result, {a: 2, b: 4, c: 6});
        test.done();
    });
},

    'mapLimit': function(test){
    var call_order = [];
    async.mapLimit([2,4,3], 2, mapIteratee.bind(this, call_order), function(err, results){
        test.ok(err === null, err + " passed instead of 'null'");
        test.same(call_order, [2,4,3]);
        test.same(results, [4,8,6]);
        test.done();
    });
},

    'mapLimit empty array': function(test){
    test.expect(1);
    async.mapLimit([], 2, function(x, callback){
        test.ok(false, 'iteratee should not be called');
        callback();
    }, function(err){
        if (err) throw err;
        test.ok(true, 'should call callback');
    });
    setTimeout(test.done, 25);
},

    'mapLimit undefined array': function(test){
    test.expect(2);
    async.mapLimit(undefined, 2, function(x, callback){
        callback();
    }, function(err, result){
        test.equals(err, null);
        test.same(result, []);
    });
    setTimeout(test.done, 50);
},

    'mapLimit limit exceeds size': function(test){
    var call_order = [];
    async.mapLimit([0,1,2,3,4,5,6,7,8,9], 20, mapIteratee.bind(this, call_order), function(err, results){
        test.same(call_order, [0,1,2,3,4,5,6,7,8,9]);
        test.same(results, [0,2,4,6,8,10,12,14,16,18]);
        test.done();
    });
},

    'mapLimit limit equal size': function(test){
    var call_order = [];
    async.mapLimit([0,1,2,3,4,5,6,7,8,9], 10, mapIteratee.bind(this, call_order), function(err, results){
        test.same(call_order, [0,1,2,3,4,5,6,7,8,9]);
        test.same(results, [0,2,4,6,8,10,12,14,16,18]);
        test.done();
    });
},

    'mapLimit zero limit': function(test){
    test.expect(2);
    async.mapLimit([0,1,2,3,4,5], 0, function(x, callback){
        test.ok(false, 'iteratee should not be called');
        callback();
    }, function(err, results){
        test.same(results, []);
        test.ok(true, 'should call callback');
    });
    setTimeout(test.done, 25);
},

    'mapLimit error': function(test){
    test.expect(2);
    var arr = [0,1,2,3,4,5,6,7,8,9];
    var call_order = [];

    async.mapLimit(arr, 3, function(x, callback){
        call_order.push(x);
        if (x === 2) {
            callback('error');
        }
    }, function(err){
        test.same(call_order, [0,1,2]);
        test.equals(err, 'error');
    });
    setTimeout(test.done, 25);
},

    'mapLimit does not continue replenishing after error': function (test) {
    var started = 0;
    var arr = [0,1,2,3,4,5,6,7,8,9];
    var delay = 10;
    var limit = 3;
    var maxTime = 10 * arr.length;

    async.mapLimit(arr, limit, function(x, callback) {
        started ++;
        if (started === 3) {
            return callback(new Error ("Test Error"));
        }
        setTimeout(function(){
            callback();
        }, delay);
    }, function(){});

    setTimeout(function(){
        test.equal(started, 3);
        test.done();
    }, maxTime);
},

    'map with Map': function(test) {
    if (typeof Map !== 'function')
        return test.done();

    var map = new Map();
    map.set(1, "a");
    map.set(2, "b");
    async.map(map, function(val, cb) {
        cb(null, val);
    }, function (err, result) {
        test.ok(Array.isArray(result), "map should return an array for an iterable");
        test.done();
    });
}

};


exports['reduce'] = function(test){
    var call_order = [];
    async.reduce([1,2,3], 0, function(a, x, callback){
        call_order.push(x);
        callback(null, a + x);
    }, function(err, result){
        test.ok(err === null, err + " passed instead of 'null'");
        test.equals(result, 6);
        test.same(call_order, [1,2,3]);
        test.done();
    });
};

exports['reduce async with non-reference memo'] = function(test){
    async.reduce([1,3,2], 0, function(a, x, callback){
        setTimeout(function(){callback(null, a + x);}, Math.random()*100);
    }, function(err, result){
        test.equals(result, 6);
        test.done();
    });
};

exports['reduce error'] = function(test){
    test.expect(1);
    async.reduce([1,2,3], 0, function(a, x, callback){
        callback('error');
    }, function(err){
        test.equals(err, 'error');
    });
    setTimeout(test.done, 50);
};

exports['inject alias'] = function(test){
    test.equals(async.inject, async.reduce);
    test.done();
};

exports['foldl alias'] = function(test){
    test.equals(async.foldl, async.reduce);
    test.done();
};

exports['reduceRight'] = function(test){
    var call_order = [];
    var a = [1,2,3];
    async.reduceRight(a, 0, function(a, x, callback){
        call_order.push(x);
        callback(null, a + x);
    }, function(err, result){
        test.equals(result, 6);
        test.same(call_order, [3,2,1]);
        test.same(a, [1,2,3]);
        test.done();
    });
};

exports['foldr alias'] = function(test){
    test.equals(async.foldr, async.reduceRight);
    test.done();
};

exports['transform implictly determines memo if not provided'] = function(test){
    async.transform([1,2,3], function(memo, x, v, callback){
        memo.push(x + 1);
        callback();
    }, function(err, result){
        test.same(result, [2, 3, 4]);
        test.done();
    });
};

exports['transform async with object memo'] = function(test){
    test.expect(2);

    async.transform([1,3,2], {}, function(memo, v, k, callback){
        setTimeout(function() {
            memo[k] = v;
            callback();
        });
    }, function(err, result) {
        test.equals(err, null);
        test.same(result, {
            0: 1,
            1: 3,
            2: 2
        });
        test.done();
    });
};

exports['transform iterating object'] = function(test){
    test.expect(2);

    async.transform({a: 1, b: 3, c: 2}, function(memo, v, k, callback){
        setTimeout(function() {
            memo[k] = v + 1;
            callback();
        });
    }, function(err, result) {
        test.equals(err, null);
        test.same(result, {a: 2, b: 4, c: 3});
        test.done();
    });
};

exports['transform error'] = function(test){
    async.transform([1,2,3], function(a, v, k, callback){
        callback('error');
    }, function(err){
        test.equals(err, 'error');
        test.done();
    });
};

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


exports['times'] = {

    'times': function(test) {
    test.expect(2);
    async.times(5, function(n, next) {
        next(null, n);
    }, function(err, results) {
        test.ok(err === null, err + " passed instead of 'null'");
        test.same(results, [0,1,2,3,4]);
        test.done();
    });
},

    'times 3': function(test){
    test.expect(1);
    var args = [];
    async.times(3, function(n, callback){
        setTimeout(function(){
            args.push(n);
            callback();
        }, n * 25);
    }, function(err){
        if (err) throw err;
        test.same(args, [0,1,2]);
        test.done();
    });
},

    'times 0': function(test){
    test.expect(1);
    async.times(0, function(n, callback){
        test.ok(false, 'iteratee should not be called');
        callback();
    }, function(err){
        if (err) throw err;
        test.ok(true, 'should call callback');
    });
    setTimeout(test.done, 25);
},

    'times error': function(test){
    test.expect(1);
    async.times(3, function(n, callback){
        callback('error');
    }, function(err){
        test.equals(err, 'error');
    });
    setTimeout(test.done, 50);
},

    'timesSeries': function(test){
    test.expect(2);
    var call_order = [];
    async.timesSeries(5, function(n, callback){
        setTimeout(function(){
            call_order.push(n);
            callback(null, n);
        }, 100 - n * 10);
    }, function(err, results){
        test.same(call_order, [0,1,2,3,4]);
        test.same(results, [0,1,2,3,4]);
        test.done();
    });
},

    'timesSeries error': function(test){
    test.expect(1);
    async.timesSeries(5, function(n, callback){
        callback('error');
    }, function(err){
        test.equals(err, 'error');
    });
    setTimeout(test.done, 50);
},

    'timesLimit': function(test){
    test.expect(7);

    var limit = 2;
    var running = 0;
    async.timesLimit(5, limit, function (i, next) {
        running++;
        test.ok(running <= limit && running > 0, running);
        setTimeout(function () {
            running--;
            next(null, i * 2);
        }, (3 - i) * 10);
    }, function(err, results){
        test.ok(err === null, err + " passed instead of 'null'");
        test.same(results, [0, 2, 4, 6, 8]);
        test.done();
    });
}

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


exports['memoize'] = {

    'memoize': function (test) {
    test.expect(5);
    var call_order = [];

    var fn = function (arg1, arg2, callback) {
        async.setImmediate(function () {
            call_order.push(['fn', arg1, arg2]);
            callback(null, arg1 + arg2);
        });
    };

    var fn2 = async.memoize(fn);
    fn2(1, 2, function (err, result) {
        test.ok(err === null, err + " passed instead of 'null'");
        test.equal(result, 3);
        fn2(1, 2, function (err, result) {
            test.equal(result, 3);
            fn2(2, 2, function (err, result) {
                test.equal(result, 4);
                test.same(call_order, [['fn',1,2], ['fn',2,2]]);
                test.done();
            });
        });
    });
},

    'maintains asynchrony': function (test) {
    test.expect(3);
    var call_order = [];

    var fn = function (arg1, arg2, callback) {
        call_order.push(['fn', arg1, arg2]);
        async.setImmediate(function () {
            call_order.push(['cb', arg1, arg2]);
            callback(null, arg1 + arg2);
        });
    };

    var fn2 = async.memoize(fn);
    fn2(1, 2, function (err, result) {
        test.equal(result, 3);
        fn2(1, 2, function (err, result) {
            test.equal(result, 3);
            async.nextTick(memoize_done);
            call_order.push('tick3');
        });
        call_order.push('tick2');
    });
    call_order.push('tick1');

    function memoize_done() {
        var async_call_order = [
            ['fn',1,2],             // initial async call
            'tick1',                // async caller
            ['cb',1,2],             // async callback
        //  ['fn',1,2], // memoized // memoized async body
            'tick2',                // handler for first async call
        //  ['cb',1,2], // memoized // memoized async response body
            'tick3'                 // handler for memoized async call
        ];
        test.same(call_order, async_call_order);
        test.done();
    }
},

    'unmemoize': function(test) {
    test.expect(4);
    var call_order = [];

    var fn = function (arg1, arg2, callback) {
        call_order.push(['fn', arg1, arg2]);
        async.setImmediate(function () {
            callback(null, arg1 + arg2);
        });
    };

    var fn2 = async.memoize(fn);
    var fn3 = async.unmemoize(fn2);
    fn3(1, 2, function (err, result) {
        test.equal(result, 3);
        fn3(1, 2, function (err, result) {
            test.equal(result, 3);
            fn3(2, 2, function (err, result) {
                test.equal(result, 4);
                test.same(call_order, [['fn',1,2], ['fn',1,2], ['fn',2,2]]);
                test.done();
            });
        });
    });
},

    'unmemoize a not memoized function': function(test) {
    test.expect(1);

    var fn = function (arg1, arg2, callback) {
        callback(null, arg1 + arg2);
    };

    var fn2 = async.unmemoize(fn);
    fn2(1, 2, function(err, result) {
        test.equal(result, 3);
    });

    test.done();
},

    'error': function (test) {
    test.expect(1);
    var testerr = new Error('test');
    var fn = function (arg1, arg2, callback) {
        callback(testerr, arg1 + arg2);
    };
    async.memoize(fn)(1, 2, function (err) {
        test.equal(err, testerr);
    });
    test.done();
},

    'multiple calls': function (test) {
    test.expect(3);
    var fn = function (arg1, arg2, callback) {
        test.ok(true);
        setTimeout(function(){
            callback(null, arg1, arg2);
        }, 10);
    };
    var fn2 = async.memoize(fn);
    fn2(1, 2, function(err, result) {
        test.equal(result, 1, 2);
    });
    fn2(1, 2, function(err, result) {
        test.equal(result, 1, 2);
        test.done();
    });
},

    'custom hash function': function (test) {
    test.expect(2);
    var testerr = new Error('test');

    var fn = function (arg1, arg2, callback) {
        callback(testerr, arg1 + arg2);
    };
    var fn2 = async.memoize(fn, function () {
        return 'custom hash';
    });
    fn2(1, 2, function (err, result) {
        test.equal(result, 3);
        fn2(2, 2, function (err, result) {
            test.equal(result, 3);
            test.done();
        });
    });
},

    'manually added memo value': function (test) {
    test.expect(1);
    var fn = async.memoize(function() {
        test(false, "Function should never be called");
    });
    fn.memo["foo"] = ["bar"];
    fn("foo", function(val) {
        test.equal(val, "bar");
        test.done();
    });
},

    'avoid constructor key return undefined': function (test) {
    test.expect(1);
    var fn = async.memoize(function(name, callback) {
        setTimeout(function(){
            callback(null, name);
        }, 100);
    });
    fn('constructor', function(error, results) {
        test.equal(results, 'constructor');
        test.done();
    });
},

    'avoid __proto__ key return undefined': function (test) {
    // Skip test if there is a Object.create bug (node 0.10 and some Chrome 30x versions)
    var x = Object.create(null);
    /* jshint proto: true */
    x.__proto__ = 'foo';
    if (x.__proto__ !== 'foo') {
        return test.done();
    }

    test.expect(1);
    var fn = async.memoize(function(name, callback) {
        setTimeout(function(){
            callback(null, name);
        }, 100);
    });
    fn('__proto__', function(error, results) {
        test.equal(results, '__proto__');
        test.done();
    });
},

    'allow hasOwnProperty as key': function (test) {
    test.expect(1);
    var fn = async.memoize(function(name, callback) {
        setTimeout(function(){
            callback(null, name);
        }, 100);
    });
    fn('hasOwnProperty', function(error, results) {
        test.equal(results, 'hasOwnProperty');
        test.done();
    });
}

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

exports['asyncify'] = {
    'asyncify': function (test) {
        var parse = async.asyncify(JSON.parse);
        parse("{\"a\":1}", function (err, result) {
            test.ok(!err);
            test.ok(result.a === 1);
            test.done();
        });
    },

    'asyncify null': function (test) {
        var parse = async.asyncify(function() {
            return null;
        });
        parse("{\"a\":1}", function (err, result) {
            test.ok(!err);
            test.ok(result === null);
            test.done();
        });
    },

    'variable numbers of arguments': function (test) {
        async.asyncify(function (x, y, z) {
            test.ok(arguments.length === 3);
            test.ok(x === 1);
            test.ok(y === 2);
            test.ok(z === 3);
        })(1, 2, 3, function () {});
        test.done();
    },

    'catch errors': function (test) {
        async.asyncify(function () {
            throw new Error("foo");
        })(function (err) {
            test.ok(err);
            test.ok(err.message === "foo");
            test.done();
        });
    },

    'dont catch errors in the callback': function (test) {
        try {
            async.asyncify(function () {})(function (err) {
                if (err) {
                    return test.done(new Error("should not get an error here"));
                }
                throw new Error("callback error");
            });
        } catch (e) {
            test.ok(e.message === "callback error");
            test.done();
        }
    },

    'promisified': [
        'native-promise-only',
        'bluebird',
        'es6-promise',
        'rsvp'
    ].reduce(function(promises, name) {
        if (isBrowser()) {
            // node only test
            return;
        }
        var Promise = require(name);
        if (typeof Promise.Promise === 'function') {
            Promise = Promise.Promise;
        }
        promises[name] = {
            'resolve': function(test) {
                var promisified = function(argument) {
                    return new Promise(function (resolve) {
                        setTimeout(function () {
                            resolve(argument + " resolved");
                        }, 15);
                    });
                };
                async.asyncify(promisified)("argument", function (err, value) {
                    if (err) {
                        return test.done(new Error("should not get an error here"));
                    }
                    test.ok(value === "argument resolved");
                    test.done();
                });
            },

            'reject': function(test) {
                var promisified = function(argument) {
                    return new Promise(function (resolve, reject) {
                        reject(argument + " rejected");
                    });
                };
                async.asyncify(promisified)("argument", function (err) {
                    test.ok(err);
                    test.ok(err.message === "argument rejected");
                    test.done();
                });
            }
        };
        return promises;
    }, {})
};

exports['timeout'] = function (test) {
    test.expect(4);

    async.series([
        async.timeout(function asyncFn(callback) {
            setTimeout(function() {
                callback(null, 'I didn\'t time out');
            }, 50);
        }, 200),
        async.timeout(function asyncFn(callback) {
            setTimeout(function() {
                callback(null, 'I will time out');
            }, 300);
        }, 150)
    ],
    function(err, results) {
        test.ok(err.message === 'Callback function "asyncFn" timed out.');
        test.ok(err.code === 'ETIMEDOUT');
        test.ok(err.info === undefined);
        test.ok(results[0] === 'I didn\'t time out');
        test.done();
    });
};

exports['timeout with info'] = function (test) {
    test.expect(4);

    var info = { custom: 'info about callback' };
    async.series([
        async.timeout(function asyncFn(callback) {
            setTimeout(function() {
                callback(null, 'I didn\'t time out');
            }, 50);
        }, 200),
        async.timeout(function asyncFn(callback) {
            setTimeout(function() {
                callback(null, 'I will time out');
            }, 300);
        }, 150, info)
    ],
    function(err, results) {
        test.ok(err.message === 'Callback function "asyncFn" timed out.');
        test.ok(err.code === 'ETIMEDOUT');
        test.ok(err.info === info);
        test.ok(results[0] === 'I didn\'t time out');
        test.done();
    });
};

exports['timeout with parallel'] = function (test) {
    test.expect(4);

    async.parallel([
        async.timeout(function asyncFn(callback) {
            setTimeout(function() {
                callback(null, 'I didn\'t time out');
            }, 50);
        }, 200),
        async.timeout(function asyncFn(callback) {
            setTimeout(function() {
                callback(null, 'I will time out');
            }, 300);
        }, 150)
    ],
    function(err, results) {
        test.ok(err.message === 'Callback function "asyncFn" timed out.');
        test.ok(err.code === 'ETIMEDOUT');
        test.ok(err.info === undefined);
        test.ok(results[0] === 'I didn\'t time out');
        test.done();
    });
};
