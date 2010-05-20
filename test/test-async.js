var async = require('async');


exports.testAuto = function(test){
    var callOrder = [];
    var testdata = [{test: 'test'}];
    async.auto({
        task1: ['task2', function(callback){
            setTimeout(function(){
                callOrder.push('task1');
                callback();
            }, 50);
        }],
        task2: function(callback){
            setTimeout(function(){
                callOrder.push('task2');
                callback();
            }, 100);
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

exports.testAutoNoCallback = function(test){
    async.auto({
        task1: function(callback){callback();},
        task2: ['task1', function(callback){callback(); test.done();}],
    });
};

exports.testWaterfall = function(test){
    test.expect(6);
    var call_order = [];
    async.waterfall([
        function(callback){
            call_order.push('fn1');
            process.nextTick(function(){callback('one', 'two');});
        },
        function(arg1, arg2, callback){
            call_order.push('fn2');
            test.equals(arg1, 'one');
            test.equals(arg2, 'two');
            setTimeout(function(){callback(arg1, arg2, 'three');}, 50);
        },
        function(arg1, arg2, arg3, callback){
            call_order.push('fn3');
            test.equals(arg1, 'one');
            test.equals(arg2, 'two');
            test.equals(arg3, 'three');
            callback('four');
        },
        function(arg4, callback){
            call_order.push('fn4');
            test.same(call_order, ['fn1','fn2','fn3','fn4']);
            callback('test');
        }
    ], function(){
        test.done();
    });
};

exports.testWaterfallNoCallback = function(test){
    async.waterfall([
        function(callback){callback();},
        function(callback){callback(); test.done();},
    ]);
};

exports.testWaterfallAsync = function(test){
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

exports.testWaterfallMultipleCallback = function(test){
    var call_order = [];
    var arr = [
        function(callback){
            call_order.push(1);
            // call the callback twice. this should call function 2 twice
            callback('one', 'two');
            callback('one', 'two');
        },
        function(arg1, arg2, callback){
            call_order.push(2);
            callback(arg1, arg2, 'three');
        },
        function(arg1, arg2, arg3, callback){
            call_order.push(3);
            callback('four');
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

exports.testParallel = function(test){
    async.parallel([
        function(callback){
            setTimeout(function(){callback(1);}, 50);
        },
        function(callback){
            setTimeout(function(){callback(2);}, 100);
        },
        function(callback){
            setTimeout(function(){callback(3,3);}, 25);
        }
    ],
    function(results){
        test.same(results, [[3,3],1,2]);
        test.done();
    });
};


exports.testParallel = function(test){
    async.parallel([
        function(callback){
            setTimeout(function(){callback(1);}, 50);
        },
        function(callback){
            setTimeout(function(){callback(2);}, 100);
        },
        function(callback){
            setTimeout(function(){callback(3,3);}, 25);
        }
    ],
    function(results){
        test.same(results, [[3,3],1,2]);
        test.done();
    });
};

exports.testParallelNoCallback = function(test){
    async.parallel([
        function(callback){callback();},
        function(callback){callback(); test.done();},
    ]);
};

exports.testSeries = function(test){
    async.series([
        function(callback){
            setTimeout(function(){callback(1);}, 50);
        },
        function(callback){
            setTimeout(function(){callback(2);}, 100);
        },
        function(callback){
            setTimeout(function(){callback(3,3);}, 25);
        }
    ],
    function(results){
        test.same(results, [1,2,[3,3]]);
        test.done();
    });
};

exports.testSeriesNoCallback = function(test){
    async.series([
        function(callback){callback();},
        function(callback){callback(); test.done();},
    ]);
};

exports.testIterator = function(test){
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
        },
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

exports.testIteratorNext = function(test){
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
        },
    ]);
    var fn = iterator.next();
    var iterator2 = fn('arg1');
    test.same(call_order, [2]);
    iterator2('arg1','arg2');
    test.same(call_order, [2,3]);
    test.equals(iterator2.next(), undefined);
    test.done();
};
