var async = require('../lib');
var expect = require('chai').expect;

describe('autoInject', function () {

    it("basics", function (done) {
        var callOrder = [];
        async.autoInject({
            task1: function(task2, callback){
                expect(task2).to.equal(2);
                setTimeout(function(){
                    callOrder.push('task1');
                    callback(null, 1);
                }, 25);
            },
            task2: function(callback){
                setTimeout(function(){
                    callOrder.push('task2');
                    callback(null, 2);
                }, 50);
            },
            task3: function(task2, callback){
                expect(task2).to.equal(2);
                callOrder.push('task3');
                callback(null, 3);
            },
            task4: function(task1, task2, callback){
                expect(task1).to.equal(1);
                expect(task2).to.equal(2);
                callOrder.push('task4');
                callback(null, 4);
            },
            task5: function(task2, callback){
                expect(task2).to.equal(2);
                setTimeout(function(){
                    callOrder.push('task5');
                    callback(null, 5);
                }, 0);
            },
            task6: function(task2, callback){
                expect(task2).to.equal(2);
                callOrder.push('task6');
                callback(null, 6);
            }
        },
        function(err, results){
            expect(results.task6).to.equal(6);
            expect(callOrder).to.eql(['task2','task3','task6','task5','task1','task4']);
            done();
        });
    });

    it('should work with array tasks', function (done) {
        var callOrder = [];

        async.autoInject({
            task1: function (cb) {
                callOrder.push('task1');
                cb(null, 1);
            },
            task2: ['task3', function ( task3 , cb ) {
                expect(task3).to.equal(3);
                callOrder.push('task2');
                cb(null, 2);
            }],
            task3: function (cb) {
                callOrder.push('task3');
                cb(null, 3);
            }
        }, function () {
            expect(callOrder).to.eql(['task1','task3','task2']);
            done();
        });
    });

    it('should handle array tasks with just a function', function (done) {
        async.autoInject({
            a: [function (cb) {
                cb(null, 1);
            }],
            b: ["a", function (a, cb) {
                expect(a).to.equal(1);
                cb();
            }]
        }, done);
    });

    it('should throw error for function without explicit parameters', function (done) {
        try {
            async.autoInject({
                a: function (){}
            });
        } catch (e) {
            // It's ok. It detected a void function
            return done();
        }

        // If didn't catch error, then it's a failed test
        done(true)
    });

    var arrowSupport = true;
    try {
        new Function('x => x');
    } catch (e) {
        arrowSupport = false;
    }

    if (arrowSupport) {
        // Needs to be run on ES6 only

        /* eslint {no-eval: 0}*/
        eval("(function() {                                                 " +
             "    it('should work with es6 arrow syntax', function (done) { " +
             "        async.autoInject({                                    " +
             "            task1: (cb)           => cb(null, 1),             " +
             "            task2: ( task3 , cb ) => cb(null, 2),             " +
             "            task3: cb             => cb(null, 3)              " +
             "        }, (err, results) => {                                " +
             "            expect(results.task1).to.equal(1);                " +
             "            expect(results.task3).to.equal(3);                " +
             "            done();                                           " +
             "        });                                                   " +
             "    });                                                       " +
             "})                                                            "
        )();
    }


    var defaultSupport = true;
    try {
        eval('function x(y = 1){ return y }');
    }catch (e){
        defaultSupport = false;
    }

    if(arrowSupport && defaultSupport){
        // Needs to be run on ES6 only

        /* eslint {no-eval: 0}*/
        eval("(function() {                                                 " +
             "    it('should work with es6 obj method syntax', function (done) { " +
             "        async.autoInject({                                    " +
             "            task1 (cb){             cb(null, 1) },            " +
             "            task2 ( task3 , cb ) {  cb(null, 2) },            " +
             "            task3 (cb) {            cb(null, 3) },            " +
             "            task4 ( task2 , cb ) {  cb(null) },               " +
             "            task5 ( task4 = 4 , cb ) { cb(null, task4 + 1) }  " +
             "        }, (err, results) => {                                " +
             "            expect(results.task1).to.equal(1);                " +
             "            expect(results.task3).to.equal(3);                " +
             "            expect(results.task4).to.equal(undefined);        " +
             "            expect(results.task5).to.equal(5);                " +
             "            done();                                           " +
             "        });                                                   " +
             "    });                                                       " +
             "})                                                            "
        )();
    }
});
