var async = require('../lib/async');

if (!Function.prototype.bind) {
    Function.prototype.bind = function (thisArg) {
        var args = Array.prototype.slice.call(arguments, 1);
        var self = this;
        return function () {
            self.apply(thisArg, args.concat(Array.prototype.slice.call(arguments)));
        };
    };
}

function eachIterator(args, x, callback) {
    setTimeout(function(){
        args.push(x);
        callback();
    }, x*25);
}

function forEachOfIterator(args, value, key, callback) {
    setTimeout(function(){
        args.push(key, value);
        callback();
    }, value*25);
}

function mapIterator(call_order, x, callback) {
    setTimeout(function(){
        call_order.push(x);
        callback(null, x*2);
    }, x*25);
}

function filterIterator(x, callback) {
    setTimeout(function(){
        callback(x % 2);
    }, x*25);
}

function detectIterator(call_order, x, callback) {
    setTimeout(function(){
        call_order.push(x);
        callback(x == 2);
    }, x*25);
}

function eachNoCallbackIterator(test, x, callback) {
    test.equal(x, 1);
    callback();
    test.done();
}

function forEachOfNoCallbackIterator(test, x, key, callback) {
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

exports['forever'] = {

'async': function (test) {
    test.expect(2);
    var counter = 0;
    function addOne(callback) {
        counter++;
        if (counter === 50) {
            return callback('too big!');
        }
        async.setImmediate(function () {
            callback();
        });
    }
    async.forever(addOne, function (err) {
        test.equal(err, 'too big!');
        test.equal(counter, 50);
        test.done();
    });
},

'sync': function (test) {
    if (isBrowser()) {
        // this will take forever in a browser
        return test.done();
    }
    test.expect(2);
    var counter = 0;
    function addOne(callback) {
        counter++;
        if (counter === 50000) { // needs to be huge to potentially overflow stack in node
            return callback('too big!');
        }
        callback();
    }
    async.forever(addOne, function (err) {
        test.equal(err, 'too big!');
        test.equal(counter, 50000);
        test.done();
    });
}

};

exports['applyEach'] = function (test) {
    test.expect(5);
    var call_order = [];
    var one = function (val, cb) {
        test.equal(val, 5);
        setTimeout(function () {
            call_order.push('one');
            cb(null, 1);
        }, 100);
    };
    var two = function (val, cb) {
        test.equal(val, 5);
        setTimeout(function () {
            call_order.push('two');
            cb(null, 2);
        }, 50);
    };
    var three = function (val, cb) {
        test.equal(val, 5);
        setTimeout(function () {
            call_order.push('three');
            cb(null, 3);
        }, 150);
    };
    async.applyEach([one, two, three], 5, function (err) {
        test.ok(err === null, err + " passed instead of 'null'");
        test.same(call_order, ['two', 'one', 'three']);
        test.done();
    });
};

exports['applyEachSeries'] = function (test) {
    test.expect(5);
    var call_order = [];
    var one = function (val, cb) {
        test.equal(val, 5);
        setTimeout(function () {
            call_order.push('one');
            cb(null, 1);
        }, 100);
    };
    var two = function (val, cb) {
        test.equal(val, 5);
        setTimeout(function () {
            call_order.push('two');
            cb(null, 2);
        }, 50);
    };
    var three = function (val, cb) {
        test.equal(val, 5);
        setTimeout(function () {
            call_order.push('three');
            cb(null, 3);
        }, 150);
    };
    async.applyEachSeries([one, two, three], 5, function (err) {
        test.ok(err === null, err + " passed instead of 'null'");
        test.same(call_order, ['one', 'two', 'three']);
        test.done();
    });
};

exports['applyEach partial application'] = function (test) {
    test.expect(4);
    var call_order = [];
    var one = function (val, cb) {
        test.equal(val, 5);
        setTimeout(function () {
            call_order.push('one');
            cb(null, 1);
        }, 100);
    };
    var two = function (val, cb) {
        test.equal(val, 5);
        setTimeout(function () {
            call_order.push('two');
            cb(null, 2);
        }, 50);
    };
    var three = function (val, cb) {
        test.equal(val, 5);
        setTimeout(function () {
            call_order.push('three');
            cb(null, 3);
        }, 150);
    };
    async.applyEach([one, two, three])(5, function (err) {
        if (err) throw err;
        test.same(call_order, ['two', 'one', 'three']);
        test.done();
    });
};

exports['compose'] = function (test) {
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
    var add2mul3add1 = async.compose(add1, mul3, add2);
    add2mul3add1(3, function (err, result) {
        if (err) {
            return test.done(err);
        }
        test.ok(err === null, err + " passed instead of 'null'");
        test.equal(result, 16);
        test.done();
    });
};

exports['compose error'] = function (test) {
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
    var add2mul3add1 = async.compose(add1, mul3, add2);
    add2mul3add1(3, function (err) {
        test.equal(err, testerr);
        test.done();
    });
};

exports['compose binding'] = function (test) {
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
    var add2mul3 = async.compose(mul3, add2);
    add2mul3.call(testcontext, 3, function (err, result) {
        if (err) {
            return test.done(err);
        }
        test.equal(this, testcontext);
        test.equal(result, 15);
        test.done();
    });
};

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

exports['auto'] = function(test){
    var callOrder = [];
    async.auto({
        task1: ['task2', function(callback){
            setTimeout(function(){
                callOrder.push('task1');
                callback();
            }, 25);
        }],
        task2: function(callback){
            setTimeout(function(){
                callOrder.push('task2');
                callback();
            }, 50);
        },
        task3: ['task2', function(callback){
            callOrder.push('task3');
            callback();
        }],
        task4: ['task1', 'task2', function(callback){
            callOrder.push('task4');
            callback();
        }],
        task5: ['task2', function(callback){
            setTimeout(function(){
              callOrder.push('task5');
              callback();
            }, 0);
        }],
        task6: ['task2', function(callback){
            callOrder.push('task6');
            callback();
        }]
    },
    function(err){
        test.ok(err === null, err + " passed instead of 'null'");
        test.same(callOrder, ['task2','task6','task3','task5','task1','task4']);
        test.done();
    });
};

exports['auto petrify'] = function (test) {
    var callOrder = [];
    async.auto({
        task1: ['task2', function (callback) {
            setTimeout(function () {
                callOrder.push('task1');
                callback();
            }, 100);
        }],
        task2: function (callback) {
            setTimeout(function () {
                callOrder.push('task2');
                callback();
            }, 200);
        },
        task3: ['task2', function (callback) {
            callOrder.push('task3');
            callback();
        }],
        task4: ['task1', 'task2', function (callback) {
            callOrder.push('task4');
            callback();
        }]
    },
    function (err) {
        if (err) throw err;
        test.same(callOrder, ['task2', 'task3', 'task1', 'task4']);
        test.done();
    });
};

exports['auto results'] = function(test){
    var callOrder = [];
    async.auto({
      task1: ['task2', function(callback, results){
          test.same(results.task2, 'task2');
          setTimeout(function(){
              callOrder.push('task1');
              callback(null, 'task1a', 'task1b');
          }, 25);
      }],
      task2: function(callback){
          setTimeout(function(){
              callOrder.push('task2');
              callback(null, 'task2');
          }, 50);
      },
      task3: ['task2', function(callback, results){
          test.same(results.task2, 'task2');
          callOrder.push('task3');
          callback(null);
      }],
      task4: ['task1', 'task2', function(callback, results){
          test.same(results.task1, ['task1a','task1b']);
          test.same(results.task2, 'task2');
          callOrder.push('task4');
          callback(null, 'task4');
      }]
    },
    function(err, results){
        test.same(callOrder, ['task2','task3','task1','task4']);
        test.same(results, {task1: ['task1a','task1b'], task2: 'task2', task3: undefined, task4: 'task4'});
        test.done();
    });
};


exports['auto empty object'] = function(test){
    async.auto({}, function(err){
        test.ok(err === null, err + " passed instead of 'null'");
        test.done();
    });
};

exports['auto error'] = function(test){
    test.expect(1);
    async.auto({
        task1: function(callback){
            callback('testerror');
        },
        task2: ['task1', function(callback){
            test.ok(false, 'task2 should not be called');
            callback();
        }],
        task3: function(callback){
            callback('testerror2');
        }
    },
    function(err){
        test.equals(err, 'testerror');
    });
    setTimeout(test.done, 100);
};

exports['auto no callback'] = function(test){
    async.auto({
        task1: function(callback){callback();},
        task2: ['task1', function(callback){callback(); test.done();}]
    });
};

exports['auto error should pass partial results'] = function(test) {
    async.auto({
        task1: function(callback){
            callback(false, 'result1');
        },
        task2: ['task1', function(callback){
            callback('testerror', 'result2');
        }],
        task3: ['task2', function(){
            test.ok(false, 'task3 should not be called');
        }]
    },
    function(err, results){
        test.equals(err, 'testerror');
        test.equals(results.task1, 'result1');
        test.equals(results.task2, 'result2');
				test.done();
    });
};

// Issue 24 on github: https://github.com/caolan/async/issues#issue/24
// Issue 76 on github: https://github.com/caolan/async/issues#issue/76
exports['auto removeListener has side effect on loop iterator'] = function(test) {
    async.auto({
        task1: ['task3', function(/*callback*/) { test.done(); }],
        task2: ['task3', function(/*callback*/) { /* by design: DON'T call callback */ }],
        task3: function(callback) { callback(); }
    });
};

// Issue 410 on github: https://github.com/caolan/async/issues/410
exports['auto calls callback multiple times'] = function(test) {
    if (isBrowser()) {
        // node only test
        test.done();
        return;
    }
    var finalCallCount = 0;
    var domain = require('domain').create();
    domain.on('error', function (e) {
        // ignore test error
        if (!e._test_error) {
            return test.done(e);
        }
    });
    domain.run(function () {
        async.auto({
            task1: function(callback) { callback(null); },
            task2: ['task1', function(callback) { callback(null); }]
        },

        // Error throwing final callback. This should only run once
        function() {
            finalCallCount++;
            var e = new Error("An error");
            e._test_error = true;
            throw e;
        });
    });
    setTimeout(function () {
        test.equal(finalCallCount, 1,
            "Final auto callback should only be called once"
        );
        test.done();
    }, 10);
};


exports['auto calls callback multiple times with parallel functions'] = function(test) {
    test.expect(1);
    async.auto({
        task1: function(callback) { setTimeout(callback,0,"err"); },
        task2: function(callback) { setTimeout(callback,0,"err"); }
    },
    // Error throwing final callback. This should only run once
    function(err) {
        test.equal(err, "err");
        test.done();
    });
};


// Issue 462 on github: https://github.com/caolan/async/issues/462
exports['auto modifying results causes final callback to run early'] = function(test) {
    async.auto({
        task1: function(callback, results){
            results.inserted = true;
            callback(null, 'task1');
        },
        task2: function(callback){
            setTimeout(function(){
                callback(null, 'task2');
            }, 50);
        },
        task3: function(callback){
            setTimeout(function(){
                callback(null, 'task3');
            }, 100);
        }
    },
    function(err, results){
        test.equal(results.inserted, true);
        test.ok(results.task3, 'task3');
        test.done();
    });
};

// Issue 263 on github: https://github.com/caolan/async/issues/263
exports['auto prevent dead-locks due to inexistant dependencies'] = function(test) {
    test.throws(function () {
        async.auto({
            task1: ['noexist', function(callback){
                callback(null, 'task1');
            }]
        });
    }, Error);
    test.done();
};

// Issue 263 on github: https://github.com/caolan/async/issues/263
exports['auto prevent dead-locks due to cyclic dependencies'] = function(test) {
    test.throws(function () {
        async.auto({
            task1: ['task2', function(callback){
                callback(null, 'task1');
            }],
            task2: ['task1', function(callback){
                callback(null, 'task2');
            }]
        });
    }, Error);
    test.done();
};

// Issue 306 on github: https://github.com/caolan/async/issues/306
exports['retry when attempt succeeds'] = function(test) {
    var failed = 3;
    var callCount = 0;
    var expectedResult = 'success';
    function fn(callback) {
        callCount++;
        failed--;
        if (!failed) callback(null, expectedResult);
        else callback(true); // respond with error
    }
    async.retry(fn, function(err, result){
        test.ok(err === null, err + " passed instead of 'null'");
        test.equal(callCount, 3, 'did not retry the correct number of times');
        test.equal(result, expectedResult, 'did not return the expected result');
        test.done();
    });
};

exports['retry when all attempts succeeds'] = function(test) {
    var times = 3;
    var callCount = 0;
    var error = 'ERROR';
    var erroredResult = 'RESULT';
    function fn(callback) {
        callCount++;
        callback(error + callCount, erroredResult + callCount); // respond with indexed values
    }
    async.retry(times, fn, function(err, result){
        test.equal(callCount, 3, "did not retry the correct number of times");
        test.equal(err, error + times, "Incorrect error was returned");
        test.equal(result, erroredResult + times, "Incorrect result was returned");
        test.done();
    });
};

exports['retry with interval when all attempts succeeds'] = function(test) {
    var times = 3;
    var interval = 500;
    var callCount = 0;
    var error = 'ERROR';
    var erroredResult = 'RESULT';
    function fn(callback) {
        callCount++;
        callback(error + callCount, erroredResult + callCount); // respond with indexed values
    }
    var start = new Date().getTime();
    async.retry({ times: times, interval: interval}, fn, function(err, result){
        var now = new Date().getTime();
        var duration = now - start;
        test.ok(duration > (interval * (times -1)),  'did not include interval');
        test.equal(callCount, 3, "did not retry the correct number of times");
        test.equal(err, error + times, "Incorrect error was returned");
        test.equal(result, erroredResult + times, "Incorrect result was returned");
        test.done();
    });
};

exports['retry as an embedded task'] = function(test) {
    var retryResult = 'RETRY';
    var fooResults;
    var retryResults;

    async.auto({
        foo: function(callback, results){
            fooResults = results;
            callback(null, 'FOO');
        },
        retry: async.retry(function(callback, results) {
            retryResults = results;
            callback(null, retryResult);
        })
    }, function(err, results){
        test.equal(results.retry, retryResult, "Incorrect result was returned from retry function");
        test.equal(fooResults, retryResults, "Incorrect results were passed to retry function");
        test.done();
    });
};

exports['retry as an embedded task with interval'] = function(test) {
    var start = new Date().getTime();
    var opts = {times: 5, interval: 100};

    async.auto({
        foo: function(callback){
            callback(null, 'FOO');
        },
        retry: async.retry(opts, function(callback) {
            callback('err');
        })
    }, function(){
        var duration = new Date().getTime() - start;
        var expectedMinimumDuration = (opts.times -1) * opts.interval;
        test.ok(duration >= expectedMinimumDuration, "The duration should have been greater than " + expectedMinimumDuration + ", but was " + duration);
        test.done();
    });
};

exports['waterfall'] = {

'basic': function(test){
    test.expect(7);
    var call_order = [];
    async.waterfall([
        function(callback){
            call_order.push('fn1');
            setTimeout(function(){callback(null, 'one', 'two');}, 0);
        },
        function(arg1, arg2, callback){
            call_order.push('fn2');
            test.equals(arg1, 'one');
            test.equals(arg2, 'two');
            setTimeout(function(){callback(null, arg1, arg2, 'three');}, 25);
        },
        function(arg1, arg2, arg3, callback){
            call_order.push('fn3');
            test.equals(arg1, 'one');
            test.equals(arg2, 'two');
            test.equals(arg3, 'three');
            callback(null, 'four');
        },
        function(arg4, callback){
            call_order.push('fn4');
            test.same(call_order, ['fn1','fn2','fn3','fn4']);
            callback(null, 'test');
        }
    ], function(err){
        test.ok(err === null, err + " passed instead of 'null'");
        test.done();
    });
},

'empty array': function(test){
    async.waterfall([], function(err){
        if (err) throw err;
        test.done();
    });
},

'non-array': function(test){
    async.waterfall({}, function(err){
        test.equals(err.message, 'First argument to waterfall must be an array of functions');
        test.done();
    });
},

'no callback': function(test){
    async.waterfall([
        function(callback){callback();},
        function(callback){callback(); test.done();}
    ]);
},

'async': function(test){
    var call_order = [];
    async.waterfall([
        function(callback){
            call_order.push(1);
            callback();
            call_order.push(2);
        },
        function(callback){
            call_order.push(3);
            callback();
        },
        function(){
            test.same(call_order, [1,2,3]);
            test.done();
        }
    ]);
},

'error': function(test){
    test.expect(1);
    async.waterfall([
        function(callback){
            callback('error');
        },
        function(callback){
            test.ok(false, 'next function should not be called');
            callback();
        }
    ], function(err){
        test.equals(err, 'error');
    });
    setTimeout(test.done, 50);
},

'multiple callback calls': function(test){
    var call_order = [];
    var arr = [
        function(callback){
            call_order.push(1);
            // call the callback twice. this should call function 2 twice
            callback(null, 'one', 'two');
            callback(null, 'one', 'two');
        },
        function(arg1, arg2, callback){
            call_order.push(2);
            callback(null, arg1, arg2, 'three');
        },
        function(arg1, arg2, arg3, callback){
            call_order.push(3);
            callback(null, 'four');
        },
        function(/*arg4*/){
            call_order.push(4);
            arr[3] = function(){
                call_order.push(4);
                test.same(call_order, [1,2,2,3,3,4,4]);
                test.done();
            };
        }
    ];
    async.waterfall(arr);
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
        async.waterfall([function (callback) {
            callback();
        }], function (err) {
            if (err) {
                return test.done(err);
            }
            test.done();
        });
    }).toString() + "())";

    vm.runInNewContext(fn, sandbox);
}

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
    async.each([1,3,2], eachIterator.bind(this, args), function(err){
        test.ok(err === null, err + " passed instead of 'null'");
        test.same(args, [1,2,3]);
        test.done();
    });
};

exports['each extra callback'] = function(test){
    var count = 0;
    async.each([1,3,2], function(val, callback) {
        count++;
        callback();
        test.throws(callback);
        if (count == 3) {
            test.done();
        }
    });
};

exports['each empty array'] = function(test){
    test.expect(1);
    async.each([], function(x, callback){
        test.ok(false, 'iterator should not be called');
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
        test.ok(false, 'iterator should not be called');
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
    async.each([1], eachNoCallbackIterator.bind(this, test));
};

exports['forEach alias'] = function (test) {
    test.strictEqual(async.each, async.forEach);
    test.done();
};

exports['forEachOf'] = function(test){
    var args = [];
    async.forEachOf({ a: 1, b: 2 }, forEachOfIterator.bind(this, args), function(err){
        test.ok(err === null, err + " passed instead of 'null'");
        test.same(args, ["a", 1, "b", 2]);
        test.done();
    });
};

exports['forEachOf empty object'] = function(test){
    test.expect(1);
    async.forEachOf({}, function(value, key, callback){
        test.ok(false, 'iterator should not be called');
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
        test.ok(false, 'iterator should not be called');
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
    async.forEachOf({ a: 1 }, forEachOfNoCallbackIterator.bind(this, test));
};

exports['forEachOf with array'] = function(test){
    var args = [];
    async.forEachOf([ "a", "b" ], forEachOfIterator.bind(this, args), function(err){
        if (err) throw err;
        test.same(args, [0, "a", 1, "b"]);
        test.done();
    });
};

exports['eachSeries'] = function(test){
    var args = [];
    async.eachSeries([1,3,2], eachIterator.bind(this, args), function(err){
        test.ok(err === null, err + " passed instead of 'null'");
        test.same(args, [1,3,2]);
        test.done();
    });
};

exports['eachSeries empty array'] = function(test){
    test.expect(1);
    async.eachSeries([], function(x, callback){
        test.ok(false, 'iterator should not be called');
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
    async.eachSeries([1], eachNoCallbackIterator.bind(this, test));
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
        test.ok(false, 'iterator should not be called');
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
    async.eachLimit(arr, 20, eachIterator.bind(this, args), function(err){
        if (err) throw err;
        test.same(args, arr);
        test.done();
    });
};

exports['eachLimit limit equal size'] = function(test){
    var args = [];
    var arr = [0,1,2,3,4,5,6,7,8,9];
    async.eachLimit(arr, 10, eachIterator.bind(this, args), function(err){
        if (err) throw err;
        test.same(args, arr);
        test.done();
    });
};

exports['eachLimit zero limit'] = function(test){
    test.expect(1);
    async.eachLimit([0,1,2,3,4,5], 0, function(x, callback){
        test.ok(false, 'iterator should not be called');
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
    async.eachLimit([1], 1, eachNoCallbackIterator.bind(this, test));
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
    async.forEachOfSeries({ a: 1, b: 2 }, forEachOfIterator.bind(this, args), function(err){
        test.ok(err === null, err + " passed instead of 'null'");
        test.same(args, [ "a", 1, "b", 2 ]);
        test.done();
    });
};

exports['forEachOfSeries empty object'] = function(test){
    test.expect(1);
    async.forEachOfSeries({}, function(x, callback){
        test.ok(false, 'iterator should not be called');
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
    async.forEachOfSeries({ a: 1 }, forEachOfNoCallbackIterator.bind(this, test));
};

exports['forEachOfSeries with array'] = function(test){
    var args = [];
    async.forEachOfSeries([ "a", "b" ], forEachOfIterator.bind(this, args), function(err){
        if (err) throw err;
        test.same(args, [ 0, "a", 1, "b" ]);
        test.done();
    });
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
        test.ok(false, 'iterator should not be called');
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
    async.forEachOfLimit(obj, 10, forEachOfIterator.bind(this, args), function(err){
        if (err) throw err;
        test.same(args, [ "a", 1, "b", 2, "c", 3, "d", 4, "e", 5 ]);
        test.done();
    });
};

exports['forEachOfLimit limit equal size'] = function(test){
    var args = [];
    var obj = { a: 1, b: 2, c: 3, d: 4, e: 5 };
    async.forEachOfLimit(obj, 5, forEachOfIterator.bind(this, args), function(err){
        if (err) throw err;
        test.same(args, [ "a", 1, "b", 2, "c", 3, "d", 4, "e", 5 ]);
        test.done();
    });
};

exports['forEachOfLimit zero limit'] = function(test){
    test.expect(1);
    async.forEachOfLimit({ a: 1, b: 2 }, 0, function(x, callback){
        test.ok(false, 'iterator should not be called');
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
    async.forEachOfLimit({ a: 1 }, 1, forEachOfNoCallbackIterator.bind(this, test));
};

exports['forEachOfLimit synchronous'] = function(test){
    var args = [];
    var obj = { a: 1, b: 2 };
    async.forEachOfLimit(obj, 5, forEachOfIterator.bind(this, args), function(err){
        if (err) throw err;
        test.same(args, [ "a", 1, "b", 2 ]);
        test.done();
    });
};

exports['forEachOfLimit with array'] = function(test){
    var args = [];
    var arr = [ "a", "b" ];
    async.forEachOfLimit(arr, 1, forEachOfIterator.bind(this, args), function (err) {
        if (err) throw err;
        test.same(args, [ 0, "a", 1, "b" ]);
        test.done();
    });
};

exports['map'] = {

'basic': function(test){
    var call_order = [];
    async.map([1,3,2], mapIterator.bind(this, call_order), function(err, results){
        test.ok(err === null, err + " passed instead of 'null'");
        test.same(call_order, [1,2,3]);
        test.same(results, [2,6,4]);
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
        callback(null);
        if (r.length >= a.length) {
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
        test.same(result, {a: 2, b: 4, c: 6});
        test.done();
    });
},

'mapSeries': function(test){
    var call_order = [];
    async.mapSeries([1,3,2], mapIterator.bind(this, call_order), function(err, results){
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
    async.mapLimit([2,4,3], 2, mapIterator.bind(this, call_order), function(err, results){
        test.ok(err === null, err + " passed instead of 'null'");
        test.same(call_order, [2,4,3]);
        test.same(results, [4,8,6]);
        test.done();
    });
},

'mapLimit empty array': function(test){
    test.expect(1);
    async.mapLimit([], 2, function(x, callback){
        test.ok(false, 'iterator should not be called');
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
    async.mapLimit([0,1,2,3,4,5,6,7,8,9], 20, mapIterator.bind(this, call_order), function(err, results){
        test.same(call_order, [0,1,2,3,4,5,6,7,8,9]);
        test.same(results, [0,2,4,6,8,10,12,14,16,18]);
        test.done();
    });
},

'mapLimit limit equal size': function(test){
    var call_order = [];
    async.mapLimit([0,1,2,3,4,5,6,7,8,9], 10, mapIterator.bind(this, call_order), function(err, results){
        test.same(call_order, [0,1,2,3,4,5,6,7,8,9]);
        test.same(results, [0,2,4,6,8,10,12,14,16,18]);
        test.done();
    });
},

'mapLimit zero limit': function(test){
    test.expect(2);
    async.mapLimit([0,1,2,3,4,5], 0, function(x, callback){
        test.ok(false, 'iterator should not be called');
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

exports['filter'] = function(test){
    async.filter([3,1,2], filterIterator, function(results){
        test.same(results, [3,1]);
        test.done();
    });
};

exports['filter original untouched'] = function(test){
    var a = [3,1,2];
    async.filter(a, function(x, callback){
        callback(x % 2);
    }, function(results){
        test.same(results, [3,1]);
        test.same(a, [3,1,2]);
        test.done();
    });
};

exports['filterSeries'] = function(test){
    async.filterSeries([3,1,2], filterIterator, function(results){
        test.same(results, [3,1]);
        test.done();
    });
};

exports['select alias'] = function(test){
    test.equals(async.select, async.filter);
    test.done();
};

exports['selectSeries alias'] = function(test){
    test.equals(async.selectSeries, async.filterSeries);
    test.done();
};

exports['reject'] = function(test){
    test.expect(1);
    async.reject([3,1,2], filterIterator, function(results){
        test.same(results, [2]);
        test.done();
    });
};

exports['reject original untouched'] = function(test){
    test.expect(2);
    var a = [3,1,2];
    async.reject(a, function(x, callback){
        callback(x % 2);
    }, function(results){
        test.same(results, [2]);
        test.same(a, [3,1,2]);
        test.done();
    });
};

exports['rejectSeries'] = function(test){
    test.expect(1);
    async.rejectSeries([3,1,2], filterIterator, function(results){
        test.same(results, [2]);
        test.done();
    });
};

exports['some true'] = function(test){
    test.expect(1);
    async.some([3,1,2], function(x, callback){
        setTimeout(function(){callback(x === 1);}, 0);
    }, function(result){
        test.equals(result, true);
        test.done();
    });
};

exports['some false'] = function(test){
    test.expect(1);
    async.some([3,1,2], function(x, callback){
        setTimeout(function(){callback(x === 10);}, 0);
    }, function(result){
        test.equals(result, false);
        test.done();
    });
};

exports['some early return'] = function(test){
    test.expect(1);
    var call_order = [];
    async.some([1,2,3], function(x, callback){
        setTimeout(function(){
            call_order.push(x);
            callback(x === 1);
        }, x*25);
    }, function(){
        call_order.push('callback');
    });
    setTimeout(function(){
        test.same(call_order, [1,'callback',2,3]);
        test.done();
    }, 100);
};

exports['any alias'] = function(test){
    test.equals(async.any, async.some);
    test.done();
};

exports['every true'] = function(test){
    test.expect(1);
    async.every([1,2,3], function(x, callback){
        setTimeout(function(){callback(true);}, 0);
    }, function(result){
        test.equals(result, true);
        test.done();
    });
};

exports['every false'] = function(test){
    test.expect(1);
    async.every([1,2,3], function(x, callback){
        setTimeout(function(){callback(x % 2);}, 0);
    }, function(result){
        test.equals(result, false);
        test.done();
    });
};

exports['every early return'] = function(test){
    test.expect(1);
    var call_order = [];
    async.every([1,2,3], function(x, callback){
        setTimeout(function(){
            call_order.push(x);
            callback(x === 1);
        }, x*25);
    }, function(){
        call_order.push('callback');
    });
    setTimeout(function(){
        test.same(call_order, [1,2,'callback',3]);
        test.done();
    }, 100);
};

exports['all alias'] = function(test){
    test.equals(async.all, async.every);
    test.done();
};

exports['detect'] = function(test){
    test.expect(2);
    var call_order = [];
    async.detect([3,2,1], detectIterator.bind(this, call_order), function(result){
        call_order.push('callback');
        test.equals(result, 2);
    });
    setTimeout(function(){
        test.same(call_order, [1,2,'callback',3]);
        test.done();
    }, 100);
};

exports['detect - mulitple matches'] = function(test){
    test.expect(2);
    var call_order = [];
    async.detect([3,2,2,1,2], detectIterator.bind(this, call_order), function(result){
        call_order.push('callback');
        test.equals(result, 2);
    });
    setTimeout(function(){
        test.same(call_order, [1,2,'callback',2,2,3]);
        test.done();
    }, 100);
};

exports['detectSeries'] = function(test){
    test.expect(2);
    var call_order = [];
    async.detectSeries([3,2,1], detectIterator.bind(this, call_order), function(result){
        call_order.push('callback');
        test.equals(result, 2);
    });
    setTimeout(function(){
        test.same(call_order, [3,2,'callback']);
        test.done();
    }, 200);
};

exports['detectSeries - multiple matches'] = function(test){
    test.expect(2);
    var call_order = [];
    async.detectSeries([3,2,2,1,2], detectIterator.bind(this, call_order), function(result){
        call_order.push('callback');
        test.equals(result, 2);
    });
    setTimeout(function(){
        test.same(call_order, [3,2,'callback']);
        test.done();
    }, 200);
};

exports['detectSeries - ensure stop'] = function (test) {
    test.expect(1);
    async.detectSeries([1, 2, 3, 4, 5], function (num, cb) {
        if (num > 3) throw new Error("detectSeries did not stop iterating");
        cb(num === 3);
    }, function (result) {
        test.equals(result, 3);
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
        test.ok(false, 'iterator should not be called');
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

exports['nextTick'] = function(test){
    test.expect(1);
    var call_order = [];
    async.nextTick(function(){call_order.push('two');});
    call_order.push('one');
    setTimeout(function(){
        test.same(call_order, ['one','two']);
        test.done();
    }, 50);
};

exports['nextTick in the browser'] = function(test){
    if (!isBrowser()) {
        // skip this test in node
        return test.done();
    }
    test.expect(1);

    var call_order = [];
    async.nextTick(function(){call_order.push('two');});

    call_order.push('one');
    setTimeout(function(){
        test.same(call_order, ['one','two']);
    }, 50);
    setTimeout(test.done, 100);
};

exports['noConflict - node only'] = function(test){
    if (!isBrowser()) {
        // node only test
        test.expect(3);
        var fs = require('fs');
        var vm = require('vm');
        var filename = __dirname + '/../lib/async.js';
        fs.readFile(filename, function(err, content){
            if(err) return test.done();

            var s = vm.createScript(content, filename);
            var s2 = vm.createScript(
                content + 'this.async2 = this.async.noConflict();',
                filename
            );

            var sandbox1 = {async: 'oldvalue'};
            s.runInNewContext(sandbox1);
            test.ok(sandbox1.async);

            var sandbox2 = {async: 'oldvalue'};
            s2.runInNewContext(sandbox2);
            test.equals(sandbox2.async, 'oldvalue');
            test.ok(sandbox2.async2);

            test.done();
        });
    }
    else test.done();
};

exports['concat'] = function(test){
    test.expect(3);
    var call_order = [];
    var iterator = function (x, cb) {
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
    async.concat([1,3,2], iterator, function(err, results){
        test.same(results, [1,2,1,3,2,1]);
        test.same(call_order, [1,2,3]);
        test.ok(err === null, err + " passed instead of 'null'");
        test.done();
    });
};

exports['concat error'] = function(test){
    test.expect(1);
    var iterator = function (x, cb) {
        cb(new Error('test error'));
    };
    async.concat([1,2,3], iterator, function(err){
        test.ok(err);
        test.done();
    });
};

exports['concatSeries'] = function(test){
    test.expect(3);
    var call_order = [];
    var iterator = function (x, cb) {
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
    async.concatSeries([1,3,2], iterator, function(err, results){
        test.same(results, [1,3,2,1,2,1]);
        test.same(call_order, [1,3,2]);
        test.ok(err === null, err + " passed instead of 'null'");
        test.done();
    });
};

exports['until'] = function (test) {
    test.expect(3);

    var call_order = [];
    var count = 0;
    async.until(
        function () {
            call_order.push(['test', count]);
            return (count == 5);
        },
        function (cb) {
            call_order.push(['iterator', count]);
            count++;
            cb();
        },
        function (err) {
            test.ok(err === null, err + " passed instead of 'null'");
            test.same(call_order, [
                ['test', 0],
                ['iterator', 0], ['test', 1],
                ['iterator', 1], ['test', 2],
                ['iterator', 2], ['test', 3],
                ['iterator', 3], ['test', 4],
                ['iterator', 4], ['test', 5],
            ]);
            test.equals(count, 5);
            test.done();
        }
    );
};

exports['doUntil'] = function (test) {
    test.expect(3);

    var call_order = [];
    var count = 0;
    async.doUntil(
        function (cb) {
            call_order.push(['iterator', count]);
            count++;
            cb();
        },
        function () {
            call_order.push(['test', count]);
            return (count == 5);
        },
        function (err) {
            test.ok(err === null, err + " passed instead of 'null'");
            test.same(call_order, [
                ['iterator', 0], ['test', 1],
                ['iterator', 1], ['test', 2],
                ['iterator', 2], ['test', 3],
                ['iterator', 3], ['test', 4],
                ['iterator', 4], ['test', 5]
            ]);
            test.equals(count, 5);
            test.done();
        }
    );
};

exports['doUntil callback params'] = function (test) {
    test.expect(2);

    var call_order = [];
    var count = 0;
    async.doUntil(
        function (cb) {
            call_order.push(['iterator', count]);
            count++;
            cb(null, count);
        },
        function (c) {
            call_order.push(['test', c]);
            return (c == 5);
        },
        function (err) {
            if (err) throw err;
            test.same(call_order, [
                ['iterator', 0], ['test', 1],
                ['iterator', 1], ['test', 2],
                ['iterator', 2], ['test', 3],
                ['iterator', 3], ['test', 4],
                ['iterator', 4], ['test', 5]
            ]);
            test.equals(count, 5);
            test.done();
        }
    );
};

exports['whilst'] = function (test) {
    test.expect(3);

    var call_order = [];

    var count = 0;
    async.whilst(
        function () {
            call_order.push(['test', count]);
            return (count < 5);
        },
        function (cb) {
            call_order.push(['iterator', count]);
            count++;
            cb();
        },
        function (err) {
            test.ok(err === null, err + " passed instead of 'null'");
            test.same(call_order, [
                ['test', 0],
                ['iterator', 0], ['test', 1],
                ['iterator', 1], ['test', 2],
                ['iterator', 2], ['test', 3],
                ['iterator', 3], ['test', 4],
                ['iterator', 4], ['test', 5],
            ]);
            test.equals(count, 5);
            test.done();
        }
    );
};

exports['doWhilst'] = function (test) {
    test.expect(3);
    var call_order = [];

    var count = 0;
    async.doWhilst(
        function (cb) {
            call_order.push(['iterator', count]);
            count++;
            cb();
        },
        function () {
            call_order.push(['test', count]);
            return (count < 5);
        },
        function (err) {
            test.ok(err === null, err + " passed instead of 'null'");
            test.same(call_order, [
                ['iterator', 0], ['test', 1],
                ['iterator', 1], ['test', 2],
                ['iterator', 2], ['test', 3],
                ['iterator', 3], ['test', 4],
                ['iterator', 4], ['test', 5]
            ]);
            test.equals(count, 5);
            test.done();
        }
    );
};

exports['doWhilst callback params'] = function (test) {
    test.expect(2);
    var call_order = [];
    var count = 0;
    async.doWhilst(
        function (cb) {
            call_order.push(['iterator', count]);
            count++;
            cb(null, count);
        },
        function (c) {
            call_order.push(['test', c]);
            return (c < 5);
        },
        function (err) {
            if (err) throw err;
            test.same(call_order, [
                ['iterator', 0], ['test', 1],
                ['iterator', 1], ['test', 2],
                ['iterator', 2], ['test', 3],
                ['iterator', 3], ['test', 4],
                ['iterator', 4], ['test', 5]
            ]);
            test.equals(count, 5);
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
            call_order.push(['iterator', count]);
            count++;
            cb();
        },
        function (err) {
            test.ok(err === null, err + " passed instead of 'null'");
            test.same(call_order, [
                ['test', 0],
                ['iterator', 0], ['test', 1],
                ['iterator', 1], ['test', 2],
                ['iterator', 2], ['test', 3],
                ['iterator', 3], ['test', 4],
                ['iterator', 4], ['test', 5],
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
            call_order.push(['iterator', count]);
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
                ['iterator', 0], ['test', 1],
                ['iterator', 1], ['test', 2],
                ['iterator', 2], ['test', 3],
                ['iterator', 3], ['test', 4],
                ['iterator', 4], ['test', 5],
            ]);
            test.equals(count, 5);
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

exports['queue'] = {

'queue': function (test) {
    test.expect(17);

    var call_order = [],
        delays = [160,80,240,80];

    // worker1: --1-4
    // worker2: -2---3
    // order of completion: 2,1,4,3

    var q = async.queue(function (task, callback) {
        setTimeout(function () {
            call_order.push('process ' + task);
            callback('error', 'arg');
        }, delays.splice(0,1)[0]);
    }, 2);

    q.push(1, function (err, arg) {
        test.equal(err, 'error');
        test.equal(arg, 'arg');
        test.equal(q.length(), 1);
        call_order.push('callback ' + 1);
    });
    q.push(2, function (err, arg) {
        test.equal(err, 'error');
        test.equal(arg, 'arg');
        test.equal(q.length(), 2);
        call_order.push('callback ' + 2);
    });
    q.push(3, function (err, arg) {
        test.equal(err, 'error');
        test.equal(arg, 'arg');
        test.equal(q.length(), 0);
        call_order.push('callback ' + 3);
    });
    q.push(4, function (err, arg) {
        test.equal(err, 'error');
        test.equal(arg, 'arg');
        test.equal(q.length(), 0);
        call_order.push('callback ' + 4);
    });
    test.equal(q.length(), 4);
    test.equal(q.concurrency, 2);

    q.drain = function () {
        test.same(call_order, [
            'process 2', 'callback 2',
            'process 1', 'callback 1',
            'process 4', 'callback 4',
            'process 3', 'callback 3'
        ]);
        test.equal(q.concurrency, 2);
        test.equal(q.length(), 0);
        test.done();
    };
},

'default concurrency': function (test) {
    test.expect(17);
    var call_order = [],
        delays = [160,80,240,80];

    // order of completion: 1,2,3,4

    var q = async.queue(function (task, callback) {
        setTimeout(function () {
            call_order.push('process ' + task);
            callback('error', 'arg');
        }, delays.splice(0,1)[0]);
    });

    q.push(1, function (err, arg) {
        test.equal(err, 'error');
        test.equal(arg, 'arg');
        test.equal(q.length(), 3);
        call_order.push('callback ' + 1);
    });
    q.push(2, function (err, arg) {
        test.equal(err, 'error');
        test.equal(arg, 'arg');
        test.equal(q.length(), 2);
        call_order.push('callback ' + 2);
    });
    q.push(3, function (err, arg) {
        test.equal(err, 'error');
        test.equal(arg, 'arg');
        test.equal(q.length(), 1);
        call_order.push('callback ' + 3);
    });
    q.push(4, function (err, arg) {
        test.equal(err, 'error');
        test.equal(arg, 'arg');
        test.equal(q.length(), 0);
        call_order.push('callback ' + 4);
    });
    test.equal(q.length(), 4);
    test.equal(q.concurrency, 1);

    q.drain = function () {
        test.same(call_order, [
            'process 1', 'callback 1',
            'process 2', 'callback 2',
            'process 3', 'callback 3',
            'process 4', 'callback 4'
        ]);
        test.equal(q.concurrency, 1);
        test.equal(q.length(), 0);
        test.done();
    };
},

'zero concurrency': function(test){
    test.expect(1);
    test.throws(function () {
        async.queue(function (task, callback) {
            callback(null, task);
        }, 0);
    });
    test.done();
},

'error propagation': function(test){
    test.expect(1);
    var results = [];

    var q = async.queue(function (task, callback) {
        callback(task.name === 'foo' ? new Error('fooError') : null);
    }, 2);

    q.drain = function() {
        test.deepEqual(results, ['bar', 'fooError']);
        test.done();
    };

    q.push({name: 'bar'}, function (err) {
        if(err) {
            results.push('barError');
            return;
        }

        results.push('bar');
    });

    q.push({name: 'foo'}, function (err) {
        if(err) {
            results.push('fooError');
            return;
        }

        results.push('foo');
    });
},

// The original queue implementation allowed the concurrency to be changed only
// on the same event loop during which a task was added to the queue. This
// test attempts to be a more robust test.
// Start with a concurrency of 1. Wait until a leter event loop and change
// the concurrency to 2. Wait again for a later loop then verify the concurrency.
// Repeat that one more time by chaning the concurrency to 5.
'changing concurrency': function (test) {
    test.expect(3);

    var q = async.queue(function(task, callback){
        setTimeout(function(){
            callback();
        }, 100);
    }, 1);

    for(var i = 0; i < 50; i++){
        q.push('');
    }

    q.drain = function(){
        test.done();
    };

    setTimeout(function(){
        test.equal(q.concurrency, 1);
        q.concurrency = 2;
        setTimeout(function(){
            test.equal(q.running(), 2);
            q.concurrency = 5;
            setTimeout(function(){
                test.equal(q.running(), 5);
            }, 500);
        }, 500);
    }, 500);
},

'push without callback': function (test) {
    test.expect(1);
    var call_order = [],
        delays = [160,80,240,80];

    // worker1: --1-4
    // worker2: -2---3
    // order of completion: 2,1,4,3

    var q = async.queue(function (task, callback) {
        setTimeout(function () {
            call_order.push('process ' + task);
            callback('error', 'arg');
        }, delays.splice(0,1)[0]);
    }, 2);

    q.push(1);
    q.push(2);
    q.push(3);
    q.push(4);

    setTimeout(function () {
        test.same(call_order, [
            'process 2',
            'process 1',
            'process 4',
            'process 3'
        ]);
        test.done();
    }, 800);
},

'push with non-function': function (test) {
    test.expect(1);
    var q = async.queue(function () {}, 1);
    test.throws(function () {
        q.push({}, 1);
    });
    test.done();
},

'unshift': function (test) {
    test.expect(1);
    var queue_order = [];

    var q = async.queue(function (task, callback) {
      queue_order.push(task);
      callback();
    }, 1);

    q.unshift(4);
    q.unshift(3);
    q.unshift(2);
    q.unshift(1);

    setTimeout(function () {
        test.same(queue_order, [ 1, 2, 3, 4 ]);
        test.done();
    }, 100);
},

'too many callbacks': function (test) {
    test.expect(1);
    var q = async.queue(function (task, callback) {
        callback();
        test.throws(function() {
            callback();
        });
        test.done();
    }, 2);

    q.push(1);
},

'bulk task': function (test) {
    test.expect(9);
    var call_order = [],
        delays = [160,80,240,80];

    // worker1: --1-4
    // worker2: -2---3
    // order of completion: 2,1,4,3

    var q = async.queue(function (task, callback) {
        setTimeout(function () {
            call_order.push('process ' + task);
            callback('error', task);
        }, delays.splice(0,1)[0]);
    }, 2);

    q.push( [1,2,3,4], function (err, arg) {
        test.equal(err, 'error');
        call_order.push('callback ' + arg);
    });

    test.equal(q.length(), 4);
    test.equal(q.concurrency, 2);

    setTimeout(function () {
        test.same(call_order, [
            'process 2', 'callback 2',
            'process 1', 'callback 1',
            'process 4', 'callback 4',
            'process 3', 'callback 3'
        ]);
        test.equal(q.concurrency, 2);
        test.equal(q.length(), 0);
        test.done();
    }, 800);
},

'idle': function(test) {
    test.expect(7);
    var q = async.queue(function (task, callback) {
      // Queue is busy when workers are running
      test.equal(q.idle(), false);
      callback();
    }, 1);

    // Queue is idle before anything added
    test.equal(q.idle(), true);

    q.unshift(4);
    q.unshift(3);
    q.unshift(2);
    q.unshift(1);

    // Queue is busy when tasks added
    test.equal(q.idle(), false);

    q.drain = function() {
        // Queue is idle after drain
        test.equal(q.idle(), true);
        test.done();
    };
},

'pause': function(test) {
    test.expect(3);
    var call_order = [],
        task_timeout = 100,
        pause_timeout = 300,
        resume_timeout = 500,
        tasks = [ 1, 2, 3, 4, 5, 6 ],

        elapsed = (function () {
            var start = (new Date()).valueOf();
            return function () {
              return Math.round(((new Date()).valueOf() - start) / 100) * 100;
            };
        })();

    var q = async.queue(function (task, callback) {
        call_order.push('process ' + task);
        call_order.push('timeout ' + elapsed());
        callback();
    });

    function pushTask () {
        var task = tasks.shift();
        if (!task) { return; }
        setTimeout(function () {
            q.push(task);
            pushTask();
        }, task_timeout);
    }
    pushTask();

    setTimeout(function () {
        q.pause();
        test.equal(q.paused, true);
    }, pause_timeout);

    setTimeout(function () {
        q.resume();
        test.equal(q.paused, false);
    }, resume_timeout);

    setTimeout(function () {
        test.same(call_order, [
            'process 1', 'timeout 100',
            'process 2', 'timeout 200',
            'process 3', 'timeout 500',
            'process 4', 'timeout 500',
            'process 5', 'timeout 500',
            'process 6', 'timeout 600'
        ]);
        test.done();
    }, 800);
},

'pause with concurrency': function(test) {
    test.expect(4);
    var call_order = [],
        task_timeout = 100,
        pause_timeout = 50,
        resume_timeout = 300,
        tasks = [ 1, 2, 3, 4, 5, 6 ],

        elapsed = (function () {
            var start = (new Date()).valueOf();
            return function () {
              return Math.round(((new Date()).valueOf() - start) / 100) * 100;
            };
        })();

    var q = async.queue(function (task, callback) {
        setTimeout(function () {
            call_order.push('process ' + task);
            call_order.push('timeout ' + elapsed());
            callback();
        }, task_timeout);
    }, 2);

    q.push(tasks);

    setTimeout(function () {
        q.pause();
        test.equal(q.paused, true);
    }, pause_timeout);

    setTimeout(function () {
        q.resume();
        test.equal(q.paused, false);
    }, resume_timeout);

    setTimeout(function () {
        test.equal(q.running(), 2);
    }, resume_timeout + 10);

    setTimeout(function () {
        test.same(call_order, [
            'process 1', 'timeout 100',
            'process 2', 'timeout 100',
            'process 3', 'timeout 400',
            'process 4', 'timeout 400',
            'process 5', 'timeout 500',
            'process 6', 'timeout 500'
        ]);
        test.done();
    }, 800);
},

'start paused': function (test) {
    test.expect(2);
    var q = async.queue(function (task, callback) {
        setTimeout(function () {
            callback();
        }, 40);
    }, 2);
    q.pause();

    q.push([1, 2, 3]);

    setTimeout(function () {
        q.resume();
    }, 5);

    setTimeout(function () {
        test.equal(q.tasks.length, 1);
        test.equal(q.running(), 2);
        q.resume();
    }, 15);

    q.drain = function () {
        test.done();
    };
},

'kill': function (test) {
    test.expect(1);
    var q = async.queue(function (task, callback) {
        setTimeout(function () {
            test.ok(false, "Function should never be called");
            callback();
        }, 300);
    }, 1);
    q.drain = function() {
        test.ok(false, "Function should never be called");
    };

    q.push(0);

    q.kill();

    setTimeout(function() {
      test.equal(q.length(), 0);
      test.done();
    }, 600);
},

'events': function(test) {
    test.expect(4);
    var calls = [];
    var q = async.queue(function(task, cb) {
        // nop
        calls.push('process ' + task);
        async.setImmediate(cb);
    }, 10);
    q.concurrency = 3;

    q.saturated = function() {
        test.ok(q.length() == 3, 'queue should be saturated now');
        calls.push('saturated');
    };
    q.empty = function() {
        test.ok(q.length() === 0, 'queue should be empty now');
        calls.push('empty');
    };
    q.drain = function() {
        test.ok(
            q.length() === 0 && q.running() === 0,
            'queue should be empty now and no more workers should be running'
        );
        calls.push('drain');
        test.same(calls, [
            'saturated',
            'process foo',
            'process bar',
            'process zoo',
            'foo cb',
            'process poo',
            'bar cb',
            'empty',
            'process moo',
            'zoo cb',
            'poo cb',
            'moo cb',
            'drain'
        ]);
        test.done();
    };
    q.push('foo', function () {calls.push('foo cb');});
    q.push('bar', function () {calls.push('bar cb');});
    q.push('zoo', function () {calls.push('zoo cb');});
    q.push('poo', function () {calls.push('poo cb');});
    q.push('moo', function () {calls.push('moo cb');});
},

'empty': function(test) {
    test.expect(2);
    var calls = [];
    var q = async.queue(function(task, cb) {
        // nop
        calls.push('process ' + task);
        async.setImmediate(cb);
    }, 3);

    q.drain = function() {
        test.ok(
            q.length() === 0 && q.running() === 0,
            'queue should be empty now and no more workers should be running'
        );
        calls.push('drain');
        test.same(calls, [
            'drain'
        ]);
        test.done();
    };
    q.push([]);
},

'saturated': function (test) {
    test.expect(1);
    var saturatedCalled = false;
    var q = async.queue(function(task, cb) {
        async.setImmediate(cb);
    }, 2);

    q.saturated = function () {
        saturatedCalled = true;
    };
    q.drain = function () {
        test.ok(saturatedCalled, "saturated not called");
        test.done();
    };

    setTimeout(function () {
        q.push(['foo', 'bar', 'baz', 'moo']);
    }, 10);
},

'started': function(test) {
    test.expect(2);

    var q = async.queue(function(task, cb) {
    cb(null, task);
    });

    test.equal(q.started, false);
    q.push([]);
    test.equal(q.started, true);
    test.done();
}

};


exports['priorityQueue'] = {

'priorityQueue': function (test) {
    test.expect(17);
    var call_order = [];

    // order of completion: 2,1,4,3

    var q = async.priorityQueue(function (task, callback) {
      call_order.push('process ' + task);
      callback('error', 'arg');
    }, 1);

    q.push(1, 1.4, function (err, arg) {
        test.equal(err, 'error');
        test.equal(arg, 'arg');
        test.equal(q.length(), 2);
        call_order.push('callback ' + 1);
    });
    q.push(2, 0.2, function (err, arg) {
        test.equal(err, 'error');
        test.equal(arg, 'arg');
        test.equal(q.length(), 3);
        call_order.push('callback ' + 2);
    });
    q.push(3, 3.8, function (err, arg) {
        test.equal(err, 'error');
        test.equal(arg, 'arg');
        test.equal(q.length(), 0);
        call_order.push('callback ' + 3);
    });
    q.push(4, 2.9, function (err, arg) {
        test.equal(err, 'error');
        test.equal(arg, 'arg');
        test.equal(q.length(), 1);
        call_order.push('callback ' + 4);
    });
    test.equal(q.length(), 4);
    test.equal(q.concurrency, 1);

    q.drain = function () {
        test.same(call_order, [
            'process 2', 'callback 2',
            'process 1', 'callback 1',
            'process 4', 'callback 4',
            'process 3', 'callback 3'
        ]);
        test.equal(q.concurrency, 1);
        test.equal(q.length(), 0);
        test.done();
    };
},

'concurrency': function (test) {
    test.expect(17);
    var call_order = [],
        delays = [160,80,240,80];

    // worker1: --2-3
    // worker2: -1---4
    // order of completion: 1,2,3,4

    var q = async.priorityQueue(function (task, callback) {
        setTimeout(function () {
            call_order.push('process ' + task);
            callback('error', 'arg');
        }, delays.splice(0,1)[0]);
    }, 2);

    q.push(1, 1.4, function (err, arg) {
        test.equal(err, 'error');
        test.equal(arg, 'arg');
        test.equal(q.length(), 2);
        call_order.push('callback ' + 1);
    });
    q.push(2, 0.2, function (err, arg) {
        test.equal(err, 'error');
        test.equal(arg, 'arg');
        test.equal(q.length(), 1);
        call_order.push('callback ' + 2);
    });
    q.push(3, 3.8, function (err, arg) {
        test.equal(err, 'error');
        test.equal(arg, 'arg');
        test.equal(q.length(), 0);
        call_order.push('callback ' + 3);
    });
    q.push(4, 2.9, function (err, arg) {
        test.equal(err, 'error');
        test.equal(arg, 'arg');
        test.equal(q.length(), 0);
        call_order.push('callback ' + 4);
    });
    test.equal(q.length(), 4);
    test.equal(q.concurrency, 2);

    q.drain = function () {
        test.same(call_order, [
            'process 1', 'callback 1',
            'process 2', 'callback 2',
            'process 3', 'callback 3',
            'process 4', 'callback 4'
        ]);
        test.equal(q.concurrency, 2);
        test.equal(q.length(), 0);
        test.done();
    };
}

};


exports['cargo'] = {

'cargo': function (test) {
    test.expect(19);
    var call_order = [],
        delays = [160, 160, 80];

    // worker: --12--34--5-
    // order of completion: 1,2,3,4,5

    var c = async.cargo(function (tasks, callback) {
        setTimeout(function () {
            call_order.push('process ' + tasks.join(' '));
            callback('error', 'arg');
        }, delays.shift());
    }, 2);

    c.push(1, function (err, arg) {
        test.equal(err, 'error');
        test.equal(arg, 'arg');
        test.equal(c.length(), 3);
        call_order.push('callback ' + 1);
    });
    c.push(2, function (err, arg) {
        test.equal(err, 'error');
        test.equal(arg, 'arg');
        test.equal(c.length(), 3);
        call_order.push('callback ' + 2);
    });

    test.equal(c.length(), 2);

    // async push
    setTimeout(function () {
        c.push(3, function (err, arg) {
            test.equal(err, 'error');
            test.equal(arg, 'arg');
            test.equal(c.length(), 1);
            call_order.push('callback ' + 3);
        });
    }, 60);
    setTimeout(function () {
        c.push(4, function (err, arg) {
            test.equal(err, 'error');
            test.equal(arg, 'arg');
            test.equal(c.length(), 1);
            call_order.push('callback ' + 4);
        });
        test.equal(c.length(), 2);
        c.push(5, function (err, arg) {
            test.equal(err, 'error');
            test.equal(arg, 'arg');
            test.equal(c.length(), 0);
            call_order.push('callback ' + 5);
        });
    }, 120);


    setTimeout(function () {
        test.same(call_order, [
            'process 1 2', 'callback 1', 'callback 2',
            'process 3 4', 'callback 3', 'callback 4',
            'process 5'  , 'callback 5'
        ]);
        test.equal(c.length(), 0);
        test.done();
    }, 800);
},

'without callback': function (test) {
    test.expect(1);
    var call_order = [],
        delays = [160,80,240,80];

    // worker: --1-2---34-5-
    // order of completion: 1,2,3,4,5

    var c = async.cargo(function (tasks, callback) {
        setTimeout(function () {
            call_order.push('process ' + tasks.join(' '));
            callback('error', 'arg');
        }, delays.shift());
    }, 2);

    c.push(1);

    setTimeout(function () {
        c.push(2);
    }, 120);
    setTimeout(function () {
        c.push(3);
        c.push(4);
        c.push(5);
    }, 180);

    setTimeout(function () {
        test.same(call_order, [
            'process 1',
            'process 2',
            'process 3 4',
            'process 5'
        ]);
        test.done();
    }, 800);
},

'bulk task': function (test) {
    test.expect(7);
    var call_order = [],
        delays = [120,40];

    // worker: -123-4-
    // order of completion: 1,2,3,4

    var c = async.cargo(function (tasks, callback) {
        setTimeout(function () {
            call_order.push('process ' + tasks.join(' '));
            callback('error', tasks.join(' '));
        }, delays.shift());
    }, 3);

    c.push( [1,2,3,4], function (err, arg) {
        test.equal(err, 'error');
        call_order.push('callback ' + arg);
    });

    test.equal(c.length(), 4);

    setTimeout(function () {
        test.same(call_order, [
            'process 1 2 3', 'callback 1 2 3',
            'callback 1 2 3', 'callback 1 2 3',
            'process 4', 'callback 4',
        ]);
        test.equal(c.length(), 0);
        test.done();
    }, 800);
},

'drain once': function (test) {
    test.expect(1);

    var c = async.cargo(function (tasks, callback) {
      callback();
    }, 3);

    var drainCounter = 0;
    c.drain = function () {
        drainCounter++;
    };

    for(var i = 0; i < 10; i++){
        c.push(i);
    }

    setTimeout(function(){
        test.equal(drainCounter, 1);
        test.done();
    }, 500);
},

'drain twice': function (test) {
    test.expect(1);

    var c = async.cargo(function (tasks, callback) {
        callback();
    }, 3);

    var loadCargo = function(){
        for(var i = 0; i < 10; i++){
            c.push(i);
        }
    };

    var drainCounter = 0;
    c.drain = function () {
        drainCounter++;
    };

    loadCargo();
    setTimeout(loadCargo, 500);

    setTimeout(function(){
      test.equal(drainCounter, 2);
      test.done();
    }, 1000);
},

'events': function(test) {
    test.expect(4);
    var calls = [];
    var q = async.cargo(function(task, cb) {
        // nop
        calls.push('process ' + task);
        async.setImmediate(cb);
    }, 1);
    q.concurrency = 3;

    q.saturated = function() {
        test.ok(q.length() == 3, 'cargo should be saturated now');
        calls.push('saturated');
    };
    q.empty = function() {
        test.ok(q.length() === 0, 'cargo should be empty now');
        calls.push('empty');
    };
    q.drain = function() {
        test.ok(
            q.length() === 0 && q.running() === 0,
            'cargo should be empty now and no more workers should be running'
        );
        calls.push('drain');
        test.same(calls, [
            'saturated',
            'process foo',
            'process bar',
            'process zoo',
            'foo cb',
            'process poo',
            'bar cb',
            'empty',
            'process moo',
            'zoo cb',
            'poo cb',
            'moo cb',
            'drain'
        ]);
        test.done();
    };
    q.push('foo', function () {calls.push('foo cb');});
    q.push('bar', function () {calls.push('bar cb');});
    q.push('zoo', function () {calls.push('zoo cb');});
    q.push('poo', function () {calls.push('poo cb');});
    q.push('moo', function () {calls.push('moo cb');});
},

'expose payload': function (test) {
    test.expect(5);
    var called_once = false;
    var cargo= async.cargo(function(tasks, cb) {
        if (!called_once) {
            test.equal(cargo.payload, 1);
            test.ok(tasks.length === 1, 'should start with payload = 1');
        } else {
            test.equal(cargo.payload, 2);
            test.ok(tasks.length === 2, 'next call shold have payload = 2');
        }
        called_once = true;
        setTimeout(cb, 25);
    }, 1);

    cargo.drain = function () {
        test.done();
    };

    test.equals(cargo.payload, 1);

    cargo.push([1, 2, 3]);

    setTimeout(function () {
        cargo.payload = 2;
    }, 15);
}

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
    }
};
