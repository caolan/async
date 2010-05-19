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
    var wrapIterator = function(iterator){
        return function(){
            var args = Array.prototype.slice.call(arguments);
            var next = iterator.next();
            if(next) args.push(wrapIterator(next));
            process.nextTick(function(){iterator.apply(null, args)});
        };
    };
    wrapIterator(exports.iterator(arr))();
};

exports.parallel = function(arr, callback){
    var results = [];
    arr.forEach(function(fn){
        fn(function(){
            var args = Array.prototype.slice.call(arguments);
            results.push((args.length > 1) ? args: args[0]);
            if(results.length == arr.length){
                callback(results);
            }
        });
    });
};

exports.series = function(arr, callback){
    var results = [];
    var saveArgs = function(fn){
        return function(){
            var args = Array.prototype.slice.call(arguments);
            results.push((args.length > 1) ? args: args[0]);
            fn.apply(null, args);
        }
    };
    var wrapIterator = function(iterator){
        return saveArgs(function(){
            var next = iterator.next();
            if(next) iterator(wrapIterator(iterator.next()));
            else iterator(saveArgs(function(){callback(results.slice(1));}));
        });
    };
    wrapIterator(exports.iterator(arr))();
};

exports.iterator = function(arr){
    var makeCallback = function(index){
        var fn = function(){
            arr[index].apply(null, arguments);
            return fn.next();
        }
        fn.next = function(){
            return (index < arr.length-1)? makeCallback(index+1): undefined;
        }
        return fn;
    };
    return makeCallback(0);
};
