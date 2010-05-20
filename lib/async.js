var events = require('events');


exports.auto = function(tasks, callback){
    callback = callback || function(){};
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
        var task = (tasks[k] instanceof Function)? [tasks[k]]: tasks[k];
        var taskCallback = function(){
            completed.push(k);
            emitter.emit('taskComplete');
        };
        var requires = task.slice(0, Math.abs(task.length-1)) || [];
        var ready = function(){
            return requires.reduce(function(a,x){
                return (a && completed.indexOf(x) != -1);
            }, true);
        };
        if(ready()) task[task.length-1](taskCallback);
        else {
            var listener = function(){
                if(ready()){
                    emitter.removeListener('taskComplete', listener);
                    task[task.length-1](taskCallback);
                }
            };
            emitter.addListener('taskComplete', listener);
        }
    });
};

exports.waterfall = function(tasks, callback){
    callback = callback || function(){};
    var wrapIterator = function(iterator){
        return function(){
            var args = Array.prototype.slice.call(arguments);
            var next = iterator.next();
            if(next) args.push(wrapIterator(next));
            else     args.push(callback);
            process.nextTick(function(){iterator.apply(null, args)});
        };
    };
    wrapIterator(exports.iterator(tasks))();
};

exports.parallel = function(tasks, callback){
    callback = callback || function(){};
    var results = [];
    tasks.forEach(function(fn){
        fn(function(){
            var args = Array.prototype.slice.call(arguments);
            results.push((args.length > 1) ? args: args[0]);
            if(results.length == tasks.length){
                callback(results);
            }
        });
    });
};

exports.series = function(tasks, callback){
    callback = callback || function(){};
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
    wrapIterator(exports.iterator(tasks))();
};

exports.iterator = function(tasks){
    var makeCallback = function(index){
        var fn = function(){
            tasks[index].apply(null, arguments);
            return fn.next();
        }
        fn.next = function(){
            return (index < tasks.length-1)? makeCallback(index+1): undefined;
        }
        return fn;
    };
    return makeCallback(0);
};
