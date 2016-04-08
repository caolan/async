var async = require('../lib');
var expect = require('chai').expect;
var _ = require('lodash');

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
        function(err, task6){
            expect(task6).to.equal(6);
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
            task2: ['task3', function (task3, cb) {
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

    it('should work with array results', function (done) {
        async.autoInject({
            task1: function (cb) {
                cb(null, 1);
            },
            task2: function (task3, cb) {
                cb(null, 2);
            },
            task3: function (cb) {
                cb(null, 3);
            }
        }, ['task3', 'task1', function (err, task3, task1) {
            expect(task1).to.equal(1);
            expect(task3).to.equal(3);
            done();
        }]);
    });

});
