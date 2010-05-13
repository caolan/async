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
            setTimeout(function(){callback(arg1, arg2, 'three');}, 100);
        },
        function(arg1, arg2, arg3, callback){
            call_order.push('fn3');
            test.equals(arg1, 'one');
            test.equals(arg2, 'two');
            test.equals(arg3, 'three');
            process.nextTick(function(){callback('four');});
        },
        function(arg4, callback){
            call_order.push('fn4');
            test.same(call_order, ['fn1','fn2','fn3','fn4']);
            test.done();
        }
    ]);
};
