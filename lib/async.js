var events = require('events');


exports.requires = function(requirements, fn){
    return {requires: requirements, run: fn};
};

exports.auto = function(tasks, callback){
    var keys = Object.keys(tasks);
    if(!keys.length) return callback(null);

    var completed = [];
    var emitter = new events.EventEmitter();
    emitter.addListener('taskComplete', function(){
        if(completed.length == keys.length){
            callback(null);
        }
    });

    keys.forEach(function(k){
        var task = tasks[k];
        if(task instanceof Function){
            task = {run: task};
        }
        var taskEnv = {
            done: function(){
                completed.push(k);
                emitter.emit('taskComplete');
            }
        };
        var requires = task.requires || [];
        var ready = function(){
            return requires.reduce(function(a,x){
                return (a && completed.indexOf(x) != -1);
            }, true);
        };
        if(ready()){
            task.run(taskEnv);
        }
        else {
            var listener = function(){
                if(ready()){
                    emitter.removeListener('taskComplete', listener);
                    task.run(taskEnv);
                }
            };
            emitter.addListener('taskComplete', listener);
        }
    });
};

exports.waterfall = function(arr){
    var i = 0;
    (function(){
        if(i < arr.length){
            var args = Array.prototype.slice.call(arguments);
            arr[i].apply(null, args.concat(arguments.callee));
            i++;
        }
    })();
};
