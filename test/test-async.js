var async = require('async');


exports.testRequires = function(test){
    var fn = function(){return 'test';};
    test.same(
        async.requires(['task1','task2'], fn),
        {requires: ['task1','task2'], run: fn}
    );
    test.done();
};

exports.testAuto = function(test){
    var callOrder = [];
    var testdata = [{test: 'test'}];
    async.auto({
        task1: {
            requires: ['task2'],
            run: function(task){
                setTimeout(function(){
                    callOrder.push('task1');
                    task.done();
                }, 100);
            }
        },
        task2: function(task){
            setTimeout(function(){
                callOrder.push('task2');
                task.done();
            }, 200);
        },
        task3: {
            requires: ['task2'],
            run: function(task){
                callOrder.push('task3');
                task.done();
            }
        },
        task4: {
            requires: ['task1', 'task2'],
            run: function(task){
                callOrder.push('task4');
                task.done();
            }
        }
    },
    function(err){
        test.same(callOrder, ['task2','task3','task1','task4']);
        test.done();
    });
};

exports.testWaterfall = function(test){
    test.expect(7);
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
            setTimeout(function(){callback(arg1, arg2, 'three');}, 100);
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
            // don't pass callback to last in waterfall chain
            test.ok(callback === undefined);
            test.done();
        }
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
