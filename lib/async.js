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
        var taskCallback = function(err){
            if(err){
                callback(err);
                // stop subsequent errors hitting the callback multiple times
                callback = function(){};
            }
            else {
                completed.push(k);
                emitter.emit('taskComplete');
            }
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
        fn(function(err){
            if(err){
                callback(err);
                callback = function(){};
            }
            else {
                var args = Array.prototype.slice.call(arguments, 1);
                results.push((args.length > 1) ? args: args[0]);
                if(results.length == tasks.length){
                    callback(null, results);
                }
            }
        });
    });
};

exports.series = function(tasks, callback){
    callback = callback || function(){};
    var results = [];
    var saveArgs = function(fn){
        return function(err){
            if(err){
                callback(err);
                callback = function(){};
            }
            else {
                var args = Array.prototype.slice.call(arguments, 1);
                results.push((args.length > 1) ? args: args[0]);
                fn.apply(null, args);
            }
        }
    };
    var wrapIterator = function(iterator){
        return saveArgs(function(){
            var next = iterator.next();
            if(next) iterator(wrapIterator(iterator.next()));
            else iterator(saveArgs(function(){
                callback(null, results.slice(1));
            }));
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

exports.forEach = function(arr, iterator, callback){
    var completed = 0;
    arr.forEach(function(x){
        iterator(x, function(err){
            if(err){
                callback(err);
                callback = function(){};
            }
            else {
                completed++;
                if(completed == arr.length) callback();
            }
        });
    });
};

exports.forEachSeries = function(arr, iterator, callback){
    var completed = 0;
    var iterate = function(){
        iterator(arr[completed], function(err){
            if(err){
                callback(err);
                callback = function(){};
            }
            else {
                completed++;
                if(completed == arr.length) callback();
                else iterate();
            }
        });
    };
    iterate();
};

exports.map = function(arr, iterator, callback){
    var results = [];
    exports.forEach(arr, function(x, callback){
        iterator(x, function(err, v){
            results.push(v);
            callback(err);
        });
    }, function(err){
        callback(err, results);
    });
};

exports.mapSeries = function(arr, iterator, callback){
    var results = [];
    exports.forEachSeries(arr, function(x, callback){
        iterator(x, function(err, v){
            results.push(v);
            callback(err);
        });
    }, function(err){
        callback(err, results);
    });
};

exports.reduce = function(arr, memo, iterator, callback){
    exports.forEach(arr, function(x, callback){
        iterator(memo, x, function(err, v){
            memo = v;
            callback(err);
        });
    }, function(err){
        callback(err, memo);
    });
};

exports.reduceSeries = function(arr, memo, iterator, callback){
    exports.forEachSeries(arr, function(x, callback){
        iterator(memo, x, function(err, v){
            memo = v;
            callback(err);
        });
    }, function(err){
        callback(err, memo);
    });
};

exports.filter = function(arr, iterator, callback){
    var results = [];
    exports.forEach(arr, function(x, callback){
        iterator(x, function(v){
            if(v) results.push(x);
            callback();
        });
    }, function(err){
        callback(results);
    });
};

exports.filterSeries = function(arr, iterator, callback){
    var results = [];
    exports.forEachSeries(arr, function(x, callback){
        iterator(x, function(v){
            if(v) results.push(x);
            callback();
        });
    }, function(err){
        callback(results);
    });
};

exports.some = function(arr, iterator, main_callback){
    exports.forEach(arr, function(x, callback){
        iterator(x, function(v){
            if(v){
                main_callback(true);
                main_callback = function(){};
            }
            callback();
        });
    }, function(err){
        main_callback(false);
    });
};

exports.every = function(arr, iterator, main_callback){
    exports.forEach(arr, function(x, callback){
        iterator(x, function(v){
            if(!v){
                main_callback(false);
                main_callback = function(){};
            }
            callback();
        });
    }, function(err){
        main_callback(true);
    });
};
