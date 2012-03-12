var async = require('../lib/async');

if (!Function.prototype.bind) {
    Function.prototype.bind = function (thisArg) {
        var args = Array.prototype.slice.call(arguments, 1);
        var self = this;
        return function () {
            self.apply(thisArg, args.concat(Array.prototype.slice.call(arguments)));
        }
    };
}

function forEachIterator(args, x, callback) {
    setTimeout(function(){
        args.push(x);
        callback();
    }, x*25);
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

function forEachNoCallbackIterator(test, x, callback) {
    test.equal(x, 1);
    callback();
    test.done();
}

function getFunctionsObject(call_order) {
    return {
        one: function(callback){
            setTimeout(function(){
                call_order.push(1);
                callback(null, 1);
            }, 25);
        },
        two: function(callback){
            setTimeout(function(){
                call_order.push(2);
                callback(null, 2);
            }, 50);
        },
        three: function(callback){
            setTimeout(function(){
                call_order.push(3);
                callback(null, 3,3);
            }, 15);
        }
    };
}

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

exports['auto await tasks'] = function(test) {
    var callOrder = [];
    var testdata = [{test: 'test'}];
    var method = function(name, timeout, callback) {
        setTimeout(function() {
            callOrder.push(name);
            callback();
        }, timeout);
    };
    async.auto({
        task1: async.task().run(function(callback) { method('task1', 25, callback); }).await('task2'),
        task2: async.task().run(function(callback) { method('task2', 50, callback); }),
        task3: async.task().run(function(callback) { method('task3', 0, callback); }).await('task2'),
        task4: async.task().run(function(callback) { method('task4', 0, callback); }).await(['task3', 'task1']),
        task5: async.task().run(function(callback) {method('task5', 10, callback); }).await('task3').await('task1')
    },
    function(err){
        test.same(callOrder, ['task2','task3','task1','task4','task5']);
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
        test.done();
    });
};

exports['auto no callback'] = function(test){
    async.auto({
        task1: function(callback){callback();},
        task2: ['task1', function(callback){callback(); test.done();}]
    });
};

exports['auto error'] = function(test){
    test.expect(2);
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
        test.equals(err['task1'], 'testerror');
        test.equals(err['task3'], 'testerror2');
    });
    setTimeout(test.done, 100);
};

exports['auto error handled'] = function(test) {
    test.expect(6);
    async.auto({
        task1: async.task().run(function(callback) {
            callback('task1 error');
        }).handle(function(err, callback) {
            test.equals(err, 'task1 error');
            callback();
        }),
        task2: ['task1', function(callback) {
            test.ok(true, 'task 2 should be called since task1 error is handled');
            callback(null, 'task2');
        }],
        task3: async.task().run(function(callback) {
            callback(null, 'task3');
        }).handle(function(err, callback) {
            test.ok(false, 'should not call handle for task3');
            callback(err);
        }),
        task4: async.task().run(function(callback) {
            callback('task4 error');
        }).handle(function(err, callback) {
            callback(null, 'task4 rescued');
        })
    }, function(err, results) {
        test.ok(!err, 'did not expect error');
        test.equals(results['task2'], 'task2');
        test.equals(results['task3'], 'task3');
        test.equals(results['task4'], 'task4 rescued');
        test.done();
    });
};

exports['auto error ignore'] = function(test) {
    test.expect();
    async.auto({
        task1: async.task().run(function(callback) { callback('task1 error'); }).ignore(),
        task2: async.task().await('task1').run(function(callback, results) {
            callback(null, 'task2');
        })
    }, function(err, results) {
        test.ok(!err, 'did not expect error');
        test.ok(!results['task1'], 'did not expect a result for task1');
        test.equals(results['task2'], 'task2');
        test.done();
    });
};

exports['auto error awaits running tasks'] = function(test) {
    test.expect(2);
    var callOrder = [];
    var run = function(t, x, c) {
        setTimeout(function() {
            callOrder.push(t);
            c(null, t);
        }, x);
    };
    var runError = function(t, x, c) {
        setTimeout(function() {
            callOrder.push(t);
            c(t + ' error');
        }, x);
    };
    async.auto({
        task1: function(callback) {
            run('task1', 25, callback);
        },
        task2: function(callback) {
            runError('task2', 5, callback);
        },
        task3: function(callback) {
            run('task3', 0, callback);
        }
    }, function(err, results) {
        test.same(callOrder, ['task3','task2','task1']);
        test.equals(err['task2'], 'task2 error');
        test.done();
    });
};

exports['auto handles exceptions'] = function(test) {
  async.auto({
    task1: async.task().run(function(callback) { throw 'task1 exception!'; }).handle(),
    task2: ['task1', function(callback, results) {
      test.ok(false, 'task2 should not be called!');
    }]
  }, function(err, results) {
    test.equals(err['task1'], 'task1 exception!');
    test.done();
  });
};

exports['auto calls task exception handler'] = function(test) {
    async.auto({
        task1: async.task()
            .run(function(callback) { throw 'task1 exception!'; })
            .handle(function(err, callback) {
                test.equals(err, 'task1 exception!');
                callback(null, 'task1 handled');
            }),
        task2: async.task().run(function(callback) { test.ok(false, 'task2 should not be called'); }).await('task3'),
        task3: async.task()
            .run(function(callback, results) {
                test.equals(results.task1, 'task1 handled');
                throw 'task3 exception!';
            })
            .handle(function(err, callback) {
                test.equals(err, 'task3 exception!');
                callback(err);
            })
            .await('task1')
    }, function(err, results) {
        test.equals(err['task3'], 'task3 exception!');
        test.done();
    });
};

exports['auto runs task compensation on exception'] = function(test) {
    // given task1, an error in any task finalizing task1 will cause task1 to be undone
    // if a task finalize task1 but the task is never called because it await another task which fails, task1 will be undone
    // if a task does not have an undone method, mentioning it in a finalize list has no effect
    var someFunction = function(callback, results) {
        callback(null, 'task' + Object.keys(results).length + 1);
    };
    var badFunction = function(callback, results) {
        throw 'badFunction';
    };
    var undoSomeFunction = function(err, callback, results) {
        test.equals(err['task3'], 'badFunction');
        callback();
    };
    async.auto({
        task1: someFunction,
        task2: async.task().run(someFunction).undo(undoSomeFunction),
        task3: async.task().run(badFunction).handle().await(['task1', 'task2']),
        task4: async.task().run(someFunction).finalize('task2').await('task2')
    }, function(err, results) {

        test.equals(err['task3'], 'badFunction');
        test.done();
    });
};

exports['auto runs task compensation on error'] = function(test) {
    // given task1, an error in any task finalizing task1 will cause task1 to be undone
    // if a task finalize task1 but the task is never called because it await another task which fails, task1 will be undone
    // if a task does not have an undone method, mentioning it in a finalize list has no effect
    test.expect(2);
    var someFunction = function(callback, results) {
        callback(null, 'task' + Object.keys(results).length + 1);
    };
    var badFunction = function(callback, results) {
        callback('badFunction');
    };
    var undoSomeFunction = function(err, callback, results) {
        test.equals(err['task3'], 'badFunction');
        callback(err);
    };
    async.auto({
        task1: someFunction,
        task2: async.task().run(someFunction).undo(undoSomeFunction),
        task3: async.task().run(badFunction).handle().finalize(['task1', 'task2']).await(['task1', 'task2']),
        task4: async.task().run(someFunction).finalize('task2').await('task3')
    }, function(err, results) {

        test.equals(err['task3'], 'badFunction');
        test.done();
    });
};

exports['auto finalizes task when any task finalizes'] = function(test) {
  
    async.auto({
        task1: async.task()
            .run(function(callback) {
                setTimeout(function() {
                    callback(null, 'task1');
                }, 10);
            })
            .undo(function(err, callback) {
                test.ok(false, 'task1 should have been finalized');
                callback();
            }),
        task2: async.task().finalize('task1'),
        task3: async.task().finalize('task1')
            .run(function(callback, results) {
                setTimeout(function() {
                    callback('task3 error');
                }, 10);
            })
    }, function(err, results) {
        test.equals(err['task3'], 'task3 error');
        test.done();
    });
};

exports['auto finalizes task'] = function(test) {
    // if a task that finalizes a completed task never runs,
    // then the completed task should be undone
    test.expect(3);
    async.auto({
        task1: async.task()
            .run(function(callback) {
                setTimeout(function() {
                    callback(null, 'task1');
                }, 10);
            })
            .undo(function(errors, callback) {
                test.equals(errors['task3'], 'task3 error');
                test.ok(true, 'task1 should have been undone');
                callback();
            }),
        task2: async.task(),
        task3: async.task()
            .run(function(callback, results) {
                setTimeout(function() {
                    callback('task3 error');
                }, 10);
            }),
        task4: async.task().await(['task2', 'task3']).finalize('task1')
            .run(function(callback) {
                callback();
            })
    }, function(err, results) {
        test.equals(err['task3'], 'task3 error');
        test.done();
    });
};

exports['auto finalize codependent tasks error'] = function(test) {
    test.expect(2);
    async.auto({
        task1: async.task().finalize('task2').run(
            function(callback) {
                setTimeout(function() {
                    callback(null, 'task1');
                }, 15);
            }
        ).undo(
            function(err, callback, results) {
                test.ok(true);
                callback();
            }
        ),
        task2: async.task().finalize('task1').run(
            function(callback) {
                setTimeout(function() {
                    callback('task2 error');
                }, 5);
            }
        )
    }, function(err, results) {
        test.equals(err['task2'], 'task2 error');
        test.done();
    });
};

exports['auto rollback works recursively'] = function(test) {
    var callOrder = [];
    var undoOrder = [];

    var run = function(t, x, c) {
        setTimeout(function() {
            callOrder.push(t);
            c();
        }, x);
    };

    var undo = function(t, x, c) {
        setTimeout(function() {
            undoOrder.push(t);
            c();
        }, x);
    };
    
    async.auto({
        task1: async.task()
            .run(function(callback) {
                run('task1', 15, callback);
            })
            .undo(function(err, callback, results) {
                undo('task1', 15, callback);
        }),
        task2: async.task().finalize('task1').await('task1')
            .run(function(callback) {
                run('task2', 10, callback);
            })
            .undo(function(err, callback, results) {
                undo('task2', 10, callback);
        }),
        task3: async.task().finalize('task2').await('task2')
            .run(function(callback) {
                run('task3', 20, callback);
            })
            .undo(function(err, callback, results) {
                undo('task3', 20, callback);
        }),
        task4: async.task().finalize('task3').await('task3').run(function(callback, results) {
            callOrder.push('task4');
            callback('task4 error');
        }),
        task5: async.task().await('task1')
            .run(function(callback) {
                run('task5', 5, callback);
            })
            .undo(function(err, callback, results) {
                undo('task5', 0, callback);
        }),
        task6: async.task().finalize('task5').await('task2')
            .run(function(callback) {
                run('task6', 5, callback);
            })
            .undo(function(err, callback, results) {
                undo('task6', 5, callback);
            })
    }, function(err, results) {
        test.same(callOrder, ['task1','task5','task2','task6','task3','task4']);
        test.same(undoOrder, ['task3','task2','task1']);
        test.done();
    });
};

// Issue 24 on github: https://github.com/caolan/async/issues#issue/24
// Issue 76 on github: https://github.com/caolan/async/issues#issue/76
exports['auto removeListener has side effect on loop iterator'] = function(test) {
    async.auto({
        task1: ['task3', function(callback) { test.done(); }],
        task2: ['task3', function(callback) { /* by design: DON'T call callback */ }],
        task3: function(callback) { callback(); }
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

exports['series object'] = function(test){
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
    async.forEach([1,3,2], forEachIterator.bind(this, args), function(err){
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

exports['forEach no callback'] = function(test){
    async.forEach([1], forEachNoCallbackIterator.bind(this, test));
};

exports['forEachSeries'] = function(test){
    var args = [];
    async.forEachSeries([1,3,2], forEachIterator.bind(this, args), function(err){
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

exports['forEachSeries no callback'] = function(test){
    async.forEachSeries([1], forEachNoCallbackIterator.bind(this, test));
};

exports['forEachLimit'] = function(test){
    var args = [];
    var arr = [0,1,2,3,4,5,6,7,8,9];
    async.forEachLimit(arr, 2, function(x,callback){
        setTimeout(function(){
            args.push(x);
            callback();
        }, x*5);
    }, function(err){
        test.same(args, arr);
        test.done();
    });
};

exports['forEachLimit empty array'] = function(test){
    test.expect(1);
    async.forEachLimit([], 2, function(x, callback){
        test.ok(false, 'iterator should not be called');
        callback();
    }, function(err){
        test.ok(true, 'should call callback');
    });
    setTimeout(test.done, 25);
};

exports['forEachLimit limit exceeds size'] = function(test){
    var args = [];
    var arr = [0,1,2,3,4,5,6,7,8,9];
    async.forEachLimit(arr, 20, forEachIterator.bind(this, args), function(err){
        test.same(args, arr);
        test.done();
    });
};

exports['forEachLimit limit equal size'] = function(test){
    var args = [];
    var arr = [0,1,2,3,4,5,6,7,8,9];
    async.forEachLimit(arr, 10, forEachIterator.bind(this, args), function(err){
        test.same(args, arr);
        test.done();
    });
};

exports['forEachLimit zero limit'] = function(test){
    test.expect(1);
    async.forEachLimit([0,1,2,3,4,5], 0, function(x, callback){
        test.ok(false, 'iterator should not be called');
        callback();
    }, function(err){
        test.ok(true, 'should call callback');
    });
    setTimeout(test.done, 25);
};

exports['forEachLimit error'] = function(test){
    test.expect(2);
    var arr = [0,1,2,3,4,5,6,7,8,9];
    var call_order = [];
    
    async.forEachLimit(arr, 3, function(x, callback){
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

exports['forEachLimit no callback'] = function(test){
    async.forEachLimit([1], 1, forEachNoCallbackIterator.bind(this, test));
};

exports['map'] = function(test){
    var call_order = [];
    async.map([1,3,2], mapIterator.bind(this, call_order), function(err, results){
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
    async.mapSeries([1,3,2], mapIterator.bind(this, call_order), function(err, results){
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
    async.reject([3,1,2], filterIterator, function(results){
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
    async.rejectSeries([3,1,2], filterIterator, function(results){
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

exports['nextTick'] = function(test){
    var call_order = [];
    async.nextTick(function(){call_order.push('two');});
    call_order.push('one');
    setTimeout(function(){
        test.same(call_order, ['one','two']);
        test.done();
    }, 50);
};

exports['nextTick in the browser'] = function(test){
    if (typeof process !== 'undefined') {
        // skip this test in node
        return test.done();
    }
    test.expect(1);

    var call_order = [];
    async.nextTick(function(){call_order.push('two');});

    call_order.push('one');
    setTimeout(function(){
        if (typeof process !== 'undefined') {
            process.nextTick = _nextTick;
        }
        test.same(call_order, ['one','two']);
    }, 50);
    setTimeout(test.done, 100);
};

exports['noConflict - node only'] = function(test){
    if (typeof process !== 'undefined') {
        // node only test
        test.expect(3);
        var fs = require('fs');
        var filename = __dirname + '/../lib/async.js';
        fs.readFile(filename, function(err, content){
            if(err) return test.done();

            // Script -> NodeScript in node v0.6.x
            var Script = process.binding('evals').Script || process.binding('evals').NodeScript;

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
    }
    else test.done();
};

exports['concat'] = function(test){
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
        test.ok(!err);
        test.done();
    });
};

exports['concat error'] = function(test){
    var iterator = function (x, cb) {
        cb(new Error('test error'));
    };
    async.concat([1,2,3], iterator, function(err, results){
        test.ok(err);
        test.done();
    });
};

exports['concatSeries'] = function(test){
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
        test.ok(!err);
        test.done();
    });
};

exports['until'] = function (test) {
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

exports['whilst'] = function (test) {
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

exports['queue'] = function (test) {
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
};

exports['queue changing concurrency'] = function (test) {
    var call_order = [],
        delays = [40,20,60,20];

    // worker1: --1-2---3-4
    // order of completion: 1,2,3,4

    var q = async.queue(function (task, callback) {
        setTimeout(function () {
            call_order.push('process ' + task);
            callback('error', 'arg');
        }, delays.splice(0,1)[0]);
    }, 2);

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
    test.equal(q.concurrency, 2);
    q.concurrency = 1;

    setTimeout(function () {
        test.same(call_order, [
            'process 1', 'callback 1',
            'process 2', 'callback 2',
            'process 3', 'callback 3',
            'process 4', 'callback 4'
        ]);
        test.equal(q.concurrency, 1);
        test.equal(q.length(), 0);
        test.done();
    }, 250);
};

exports['queue push without callback'] = function (test) {
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
};

exports['queue bulk task'] = function (test) {
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
};

exports['memoize'] = function (test) {
    test.expect(4);
    var call_order = [];

    var fn = function (arg1, arg2, callback) {
        call_order.push(['fn', arg1, arg2]);
        callback(null, arg1 + arg2);
    };

    var fn2 = async.memoize(fn);
    fn2(1, 2, function (err, result) {
        test.equal(result, 3);
    });
    fn2(1, 2, function (err, result) {
        test.equal(result, 3);
    });
    fn2(2, 2, function (err, result) {
        test.equal(result, 4);
    });

    test.same(call_order, [['fn',1,2], ['fn',2,2]]);
    test.done();
};

exports['unmemoize'] = function(test) {
    test.expect(4);
    var call_order = [];

    var fn = function (arg1, arg2, callback) {
        call_order.push(['fn', arg1, arg2]);
        callback(null, arg1 + arg2);
    };

    var fn2 = async.memoize(fn);
    var fn3 = async.unmemoize(fn2);
    fn3(1, 2, function (err, result) {
        test.equal(result, 3);
    });
    fn3(1, 2, function (err, result) {
        test.equal(result, 3);
    });
    fn3(2, 2, function (err, result) {
        test.equal(result, 4);
    });

    test.same(call_order, [['fn',1,2], ['fn',1,2], ['fn',2,2]]);

    test.done();
}

exports['unmemoize a not memoized function'] = function(test) {
    test.expect(1);

    var fn = function (arg1, arg2, callback) {
        callback(null, arg1 + arg2);
    };

    var fn2 = async.unmemoize(fn);
    fn2(1, 2, function(err, result) {
        test.equal(result, 3);
    });

    test.done();
}

exports['memoize error'] = function (test) {
    test.expect(1);
    var testerr = new Error('test');
    var fn = function (arg1, arg2, callback) {
        callback(testerr, arg1 + arg2);
    };
    async.memoize(fn)(1, 2, function (err, result) {
        test.equal(err, testerr);
    });
    test.done();
};

exports['memoize multiple calls'] = function (test) {
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
};

exports['memoize custom hash function'] = function (test) {
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
    });
    fn2(2, 2, function (err, result) {
        test.equal(result, 3);
    });
    test.done();
};

// Issue 10 on github: https://github.com/caolan/async/issues#issue/10
exports['falsy return values in series'] = function (test) {
    function taskFalse(callback) {
        async.nextTick(function() {
            callback(null, false);
        });
    };
    function taskUndefined(callback) {
        async.nextTick(function() {
            callback(null, undefined);
        });
    };
    function taskEmpty(callback) {
        async.nextTick(function() {
            callback(null);
        });
    };
    function taskNull(callback) {
        async.nextTick(function() {
            callback(null, null);
        });
    };
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
};

// Issue 10 on github: https://github.com/caolan/async/issues#issue/10
exports['falsy return values in parallel'] = function (test) {
    function taskFalse(callback) {
        async.nextTick(function() {
            callback(null, false);
        });
    };
    function taskUndefined(callback) {
        async.nextTick(function() {
            callback(null, undefined);
        });
    };
    function taskEmpty(callback) {
        async.nextTick(function() {
            callback(null);
        });
    };
    function taskNull(callback) {
        async.nextTick(function() {
            callback(null, null);
        });
    };
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

exports['queue events'] = function(test) {
    var calls = [];
    var q = async.queue(function(task, cb) {
        // nop
        calls.push('process ' + task);
        cb();
    }, 3);

    q.saturated = function() {
        test.ok(q.length() == 3, 'queue should be saturated now');
        calls.push('saturated');
    };
    q.empty = function() {
        test.ok(q.length() == 0, 'queue should be empty now');
        calls.push('empty');
    };
    q.drain = function() {
        test.ok(
            q.length() == 0 && q.running() == 0,
            'queue should be empty now and no more workers should be running'
        );
        calls.push('drain');
        test.same(calls, [
            'saturated',
            'process foo',
            'foo cb',
            'process bar',
            'bar cb',
            'process zoo',
            'zoo cb',
            'process poo',
            'poo cb',
            'empty',
            'process moo',
            'moo cb',
            'drain',
        ]);
        test.done();
    };
    q.push('foo', function () {calls.push('foo cb');});
    q.push('bar', function () {calls.push('bar cb');});
    q.push('zoo', function () {calls.push('zoo cb');});
    q.push('poo', function () {calls.push('poo cb');});
    q.push('moo', function () {calls.push('moo cb');});
};
