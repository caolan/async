var events = require('events');


exports.forEach = function(arr, iterator, callback){
    if(!arr.length) return callback();
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
    if(!arr.length) return callback();
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


var doParallel = function(fn){
    return function(){
        var args = Array.prototype.slice.call(arguments);
        return fn.apply(null, [exports.forEach].concat(args));
    }
};
var doSeries = function(fn){
    return function(){
        var args = Array.prototype.slice.call(arguments);
        return fn.apply(null, [exports.forEachSeries].concat(args));
    }
};


var _map = function(eachfn, arr, iterator, callback){
    var results = [];
    for(var i=0; i<arr.length; i++){
        arr[i] = {index: i, value: arr[i]};
    }
    eachfn(arr, function(x, callback){
        iterator(x.value, function(err, v){
            results[x.index] = v;
            callback(err);
        });
    }, function(err){
        callback(err, results);
    });
};
exports.map = doParallel(_map);
exports.mapSeries = doSeries(_map);


// reduce only has a series version, as doing reduce in parallel won't
// work in many situations.
exports.reduce = function(arr, memo, iterator, callback){
    exports.forEachSeries(arr, function(x, callback){
        iterator(memo, x, function(err, v){
            memo = v;
            callback(err);
        });
    }, function(err){
        callback(err, memo);
    });
};


var _filter = function(eachfn, arr, iterator, callback){
    var results = [];
    for(var i=0; i<arr.length; i++){
        arr[i] = {index: i, value: arr[i]};
    }
    eachfn(arr, function(x, callback){
        iterator(x.value, function(v){
            if(v) results.push(x);
            callback();
        });
    }, function(err){
        callback(results.sort(function(a,b){
            return a.index - b.index;
        }).map(function(x){
            return x.value;
        }));
    });
};
exports.filter = doParallel(_filter);
exports.filterSeries = doSeries(_filter);


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
    if(!tasks.length) return callback();
    callback = callback || function(){};
    var wrapIterator = function(iterator){
        return function(err){
            if(err){
                callback(err);
                callback = function(){};
            }
            else {
                var args = Array.prototype.slice.call(arguments, 1);
                var next = iterator.next();
                if(next) args.push(wrapIterator(next));
                else     args.push(callback);
                process.nextTick(function(){iterator.apply(null, args)});
            }
        };
    };
    wrapIterator(exports.iterator(tasks))();
};

exports.parallel = function(tasks, callback){
    callback = callback || function(){};
    exports.map(tasks, function(fn, callback){
        fn(function(err){
            var args = Array.prototype.slice.call(arguments,1);
            if(args.length <= 1) args = args[0];
            callback.call(null, err, args || null);
        });
    }, callback);
};

exports.series = function(tasks, callback){
    callback = callback || function(){};
    exports.mapSeries(tasks, function(fn, callback){
        fn(function(err){
            var args = Array.prototype.slice.call(arguments,1);
            if(args.length <= 1) args = args[0];
            callback.call(null, err, args || null);
        });
    }, callback);
};

exports.iterator = function(tasks){
    var makeCallback = function(index){
        var fn = function(){
            if(tasks.length) tasks[index].apply(null, arguments);
            return fn.next();
        }
        fn.next = function(){
            return (index < tasks.length-1)? makeCallback(index+1): undefined;
        }
        return fn;
    };
    return makeCallback(0);
};
