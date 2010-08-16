var async = require('async');


exports['auto'] = function(test){
    var callOrder = [];
    var testdata = [{test: 'test'}];
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
        }]
    },
    function(err){
        test.same(callOrder, ['task2','task3','task1','task4']);
        test.done();
    });
};

exports['auto empty object'] = function(test){
    async.auto({}, function(err){
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

exports['waterfall'] = function(test){
    test.expect(6);
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
        test.done();
    });
};

exports['waterfall empty array'] = function(test){
    async.waterfall([], function(err){
        test.done();
    });
};

exports['waterfall no callback'] = function(test){
    async.waterfall([
        function(callback){callback();},
        function(callback){callback(); test.done();}
    ]);
};

exports['waterfall async'] = function(test){
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
};

exports['waterfall error'] = function(test){
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
};

exports['waterfall multiple callback calls'] = function(test){
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
        function(arg4){
            call_order.push(4);
            arr[3] = function(){
                call_order.push(4);
                test.same(call_order, [1,2,2,3,3,4,4]);
                test.done();
            };
        }
    ];
    async.waterfall(arr);
};


exports['parallel'] = function(test){
    var call_order = [];
    async.parallel([
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
        test.equals(err, null);
        test.same(call_order, [3,1,2]);
        test.same(results, [1,2,[3,3]]);
        test.done();
    });
};

exports['parallel empty array'] = function(test){
    async.parallel([], function(err, results){
        test.equals(err, null);
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
    function(err, results){
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

exports['series'] = function(test){
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
        test.equals(err, null);
        test.same(results, [1,2,[3,3]]);
        test.same(call_order, [1,2,3]);
        test.done();
    });
};

exports['series empty array'] = function(test){
    async.series([], function(err, results){
        test.equals(err, null);
        test.same(results, []);
        test.done();
    });
};

exports['series error'] = function(test){
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
    function(err, results){
        test.equals(err, 'error');
    });
    setTimeout(test.done, 100);
};

exports['series no callback'] = function(test){
    async.series([
        function(callback){callback();},
        function(callback){callback(); test.done();},
    ]);
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

exports['forEach'] = function(test){
    var args = [];
    async.forEach([1,3,2], function(x, callback){
        setTimeout(function(){
            args.push(x);
            callback();
        }, x*25);
    }, function(err){
        test.same(args, [1,2,3]);
        test.done();
    });
};

exports['forEach empty array'] = function(test){
    test.expect(1);
    async.forEach([], function(x, callback){
        test.ok(false, 'iterator should not be called');
        callback();
    }, function(err){
        test.ok(true, 'should call callback');
    });
    setTimeout(test.done, 25);
};

exports['forEach error'] = function(test){
    test.expect(1);
    async.forEach([1,2,3], function(x, callback){
        callback('error');
    }, function(err){
        test.equals(err, 'error');
    });
    setTimeout(test.done, 50);
};

exports['forEachSeries'] = function(test){
    var args = [];
    async.forEachSeries([1,3,2], function(x, callback){
        setTimeout(function(){
            args.push(x);
            callback();
        }, x*25);
    }, function(err){
        test.same(args, [1,3,2]);
        test.done();
    });
};

exports['forEachSeries empty array'] = function(test){
    test.expect(1);
    async.forEachSeries([], function(x, callback){
        test.ok(false, 'iterator should not be called');
        callback();
    }, function(err){
        test.ok(true, 'should call callback');
    });
    setTimeout(test.done, 25);
};

exports['forEachSeries error'] = function(test){
    test.expect(2);
    var call_order = [];
    async.forEachSeries([1,2,3], function(x, callback){
        call_order.push(x);
        callback('error');
    }, function(err){
        test.same(call_order, [1]);
        test.equals(err, 'error');
    });
    setTimeout(test.done, 50);
};

exports['map'] = function(test){
    var call_order = [];
    async.map([1,3,2], function(x, callback){
        setTimeout(function(){
            call_order.push(x);
            callback(null, x*2);
        }, x*25);
    }, function(err, results){
        test.same(call_order, [1,2,3]);
        test.same(results, [2,6,4]);
        test.done();
    });
};

exports['map original untouched'] = function(test){
    var a = [1,2,3];
    async.map(a, function(x, callback){
        callback(null, x*2);
    }, function(err, results){
        test.same(results, [2,4,6]);
        test.same(a, [1,2,3]);
        test.done();
    });
};

exports['map error'] = function(test){
    test.expect(1);
    async.map([1,2,3], function(x, callback){
        callback('error');
    }, function(err, results){
        test.equals(err, 'error');
    });
    setTimeout(test.done, 50);
};

exports['mapSeries'] = function(test){
    var call_order = [];
    async.mapSeries([1,3,2], function(x, callback){
        setTimeout(function(){
            call_order.push(x);
            callback(null, x*2);
        }, x*25);
    }, function(err, results){
        test.same(call_order, [1,3,2]);
        test.same(results, [2,6,4]);
        test.done();
    });
};

exports['mapSeries error'] = function(test){
    test.expect(1);
    async.mapSeries([1,2,3], function(x, callback){
        callback('error');
    }, function(err, results){
        test.equals(err, 'error');
    });
    setTimeout(test.done, 50);
};

exports['reduce'] = function(test){
    var call_order = [];
    async.reduce([1,2,3], 0, function(a, x, callback){
        call_order.push(x);
        callback(null, a + x);
    }, function(err, result){
        test.equals(result, 6);
        test.same(call_order, [1,2,3]);
        test.done();
    });
};

exports['reduce async with non-reference memo'] = function(test){
    async.reduce([1,3,2], 0, function(a, x, callback){
        setTimeout(function(){callback(null, a + x)}, Math.random()*100);
    }, function(err, result){
        test.equals(result, 6);
        test.done();
    });
};

exports['reduce error'] = function(test){
    test.expect(1);
    async.reduce([1,2,3], 0, function(a, x, callback){
        callback('error');
    }, function(err, result){
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
    async.filter([3,1,2], function(x, callback){
        setTimeout(function(){callback(x % 2);}, x*25);
    }, function(results){
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
    async.filterSeries([3,1,2], function(x, callback){
        setTimeout(function(){callback(x % 2);}, x*25);
    }, function(results){
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
    async.reject([3,1,2], function(x, callback){
        setTimeout(function(){callback(x % 2);}, x*25);
    }, function(results){
        test.same(results, [2]);
        test.done();
    });
};

exports['reject original untouched'] = function(test){
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
    async.rejectSeries([3,1,2], function(x, callback){
        setTimeout(function(){callback(x % 2);}, x*25);
    }, function(results){
        test.same(results, [2]);
        test.done();
    });
};

exports['some true'] = function(test){
    async.some([3,1,2], function(x, callback){
        setTimeout(function(){callback(x === 1);}, 0);
    }, function(result){
        test.equals(result, true);
        test.done();
    });
};

exports['some false'] = function(test){
    async.some([3,1,2], function(x, callback){
        setTimeout(function(){callback(x === 10);}, 0);
    }, function(result){
        test.equals(result, false);
        test.done();
    });
};

exports['some early return'] = function(test){
    var call_order = [];
    async.some([1,2,3], function(x, callback){
        setTimeout(function(){
            call_order.push(x);
            callback(x === 1);
        }, x*25);
    }, function(result){
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
    async.every([1,2,3], function(x, callback){
        setTimeout(function(){callback(true);}, 0);
    }, function(result){
        test.equals(result, true);
        test.done();
    });
};

exports['every false'] = function(test){
    async.every([1,2,3], function(x, callback){
        setTimeout(function(){callback(x % 2);}, 0);
    }, function(result){
        test.equals(result, false);
        test.done();
    });
};

exports['every early return'] = function(test){
    var call_order = [];
    async.every([1,2,3], function(x, callback){
        setTimeout(function(){
            call_order.push(x);
            callback(x === 1);
        }, x*25);
    }, function(result){
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
    var call_order = [];
    async.detect([3,2,1], function(x, callback){
        setTimeout(function(){
            call_order.push(x);
            callback(x == 2);
        }, x*25);
    }, function(result){
        call_order.push('callback');
        test.equals(result, 2);
    });
    setTimeout(function(){
        test.same(call_order, [1,2,'callback',3]);
        test.done();
    }, 100);
};

exports['detectSeries'] = function(test){
    var call_order = [];
    async.detectSeries([3,2,1], function(x, callback){
        setTimeout(function(){
            call_order.push(x);
            callback(x == 2);
        }, x*25);
    }, function(result){
        call_order.push('callback');
        test.equals(result, 2);
    });
    setTimeout(function(){
        test.same(call_order, [3,2,'callback']);
        test.done();
    }, 200);
};

exports['sortBy'] = function(test){
    async.sortBy([{a:1},{a:15},{a:6}], function(x, callback){
        setTimeout(function(){callback(null, x.a);}, 0);
    }, function(err, result){
        test.same(result, [{a:1},{a:6},{a:15}]);
        test.done();
    });
};

exports['apply'] = function(test){
    test.expect(6);
    var fn = function(){
        test.same(Array.prototype.slice.call(arguments), [1,2,3,4])
    };
    async.apply(fn, 1, 2, 3, 4)();
    async.apply(fn, 1, 2, 3)(4);
    async.apply(fn, 1, 2)(3, 4);
    async.apply(fn, 1)(2, 3, 4);
    async.apply(fn)(1, 2, 3, 4);
    test.equals(
        async.apply(function(name){return 'hello ' + name}, 'world')(),
        'hello world'
    );
    test.done();
};


// generates tests for console functions such as async.log
var console_fn_tests = function(name){

    exports[name] = function(test){
        test.expect(5);
        var fn = function(arg1, callback){
            test.equals(arg1, 'one');
            process.nextTick(function(){callback(null, 'test');});
        };
        var fn_err = function(arg1, callback){
            test.equals(arg1, 'one');
            process.nextTick(function(){callback('error');});
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

    exports[name + ' without console.' + name] = function(test){
        var _console = global.console;
        global.console = undefined;
        var fn = function(callback){callback(null, 'val');};
        var fn_err = function(callback){callback('error');};
        async[name](fn);
        async[name](fn_err);
        global.console = _console;
        test.done();
    };

    exports[name + ' with multiple result params'] = function(test){
        var fn = function(callback){callback(null, 'one', 'two', 'three');};
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
};

console_fn_tests('log');
console_fn_tests('dir');
/*console_fn_tests('info');
console_fn_tests('warn');
console_fn_tests('error');*/

exports['nextTick'] = function(test){
    var call_order = [];
    async.nextTick(function(){call_order.push('two');});
    call_order.push('one');
    setTimeout(function(){
        test.same(call_order, ['one','two']);
        test.done();
    }, 50);
};

exports['nextTick in node'] = function(test){
    test.expect(1);
    var _nextTick = process.nextTick;
    process.nextTick = function(){
        process.nextTick = _nextTick;
        test.ok(true, 'process.nextTick called');
        test.done();
    };
    async.nextTick(function(){});
};

exports['nextTick in the browser'] = function(test){
    test.expect(1);
    var _nextTick = process.nextTick;
    process.nextTick = undefined;

    var call_order = [];
    async.nextTick(function(){call_order.push('two');});

    call_order.push('one');
    setTimeout(function(){
        process.nextTick = _nextTick;
        test.same(call_order, ['one','two']);
    }, 50);
    setTimeout(test.done, 100);
};

exports['noConflict'] = function(test){
    test.expect(3);
    var fs = require('fs');
    var filename = __dirname + '/../lib/async.js';
    fs.readFile(filename, function(err, content){
        if(err) return test.done();
        var Script = process.binding('evals').Script;

        var s = new Script(content, filename);
        var s2 = new Script(
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
};
