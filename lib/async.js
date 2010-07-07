(function(exports){

    //// cross-browser compatiblity functions ////

    var _forEach = function(arr, iterator){
        if(arr.forEach) return arr.forEach(iterator);
        for(var i=0; i<arr.length; i++){
            iterator(arr[i], i, arr);
        }
    };

    var _map = function(arr, iterator){
        if(arr.map) return arr.map(iterator);
        var results = [];
        _forEach(arr, function(x, i, a){
            results.push(iterator(x, i, a));
        })
        return results;
    };

    var _reduce = function(arr, iterator, memo){
        if(arr.reduce) return arr.reduce(iterator, memo);
        _forEach(arr, function(x, i, a){
            memo = iterator(memo, x, i, a);
        });
        return memo;
    };

    var _keys = function(obj){
        if(Object.keys) return Object.keys(obj);
        var keys = [];
        for(var k in obj){
            if(obj.hasOwnProperty(k)) keys.push(k);
        }
        return keys;
    };

    var _indexOf = function(arr, item){
        if(arr.indexOf) return arr.indexOf(item);
        for(var i=0; i<arr.length; i++){
            if(arr[i] === item) return i;
        }
        return -1;
    };

    //// nextTick implementation with browser-compatible fallback ////

    var _nextTick;
    if(typeof process === 'undefined' || !process.nextTick){
        _nextTick = function(fn){
            setTimeout(fn, 0);
        };
    }
    else _nextTick = process.nextTick;


    //// exported async module functions ////

    exports.forEach = function(arr, iterator, callback){
        if(!arr.length) return callback();
        var completed = 0;
        _forEach(arr, function(x){
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
        };
    };
    var doSeries = function(fn){
        return function(){
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [exports.forEachSeries].concat(args));
        };
    };


    var _asyncMap = function(eachfn, arr, iterator, callback){
        var results = [];
        arr = _map(arr, function(x, i){
            return {index: i, value: x};
        });
        eachfn(arr, function(x, callback){
            iterator(x.value, function(err, v){
                results[x.index] = v;
                callback(err);
            });
        }, function(err){
            callback(err, results);
        });
    };
    exports.map = doParallel(_asyncMap);
    exports.mapSeries = doSeries(_asyncMap);


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
    // inject alias
    exports.inject = exports.reduce;
    // foldl alias
    exports.foldl = exports.reduce;

    exports.reduceRight = function(arr, memo, iterator, callback){
        var reversed = _map(arr, function(x){return x;}).reverse();
        exports.reduce(reversed, memo, iterator, callback);
    };
    // foldr alias
    exports.foldr = exports.reduceRight;

    var _filter = function(eachfn, arr, iterator, callback){
        var results = [];
        arr = _map(arr, function(x, i){
            return {index: i, value: x};
        });
        eachfn(arr, function(x, callback){
            iterator(x.value, function(v){
                if(v) results.push(x);
                callback();
            });
        }, function(err){
            callback(_map(results.sort(function(a,b){
                return a.index - b.index;
            }), function(x){
                return x.value;
            }));
        });
    };
    exports.filter = doParallel(_filter);
    exports.filterSeries = doSeries(_filter);
    // select alias
    exports.select = exports.filter;
    exports.selectSeries = exports.filterSeries;

    var _reject = function(eachfn, arr, iterator, callback){
        var results = [];
        arr = _map(arr, function(x, i){
            return {index: i, value: x};
        });
        eachfn(arr, function(x, callback){
            iterator(x.value, function(v){
                if(!v) results.push(x);
                callback();
            });
        }, function(err){
            callback(_map(results.sort(function(a,b){
                return a.index - b.index;
            }), function(x){
                return x.value;
            }));
        });
    };
    exports.reject = doParallel(_reject);
    exports.rejectSeries = doSeries(_reject);

    var _detect = function(eachfn, arr, iterator, main_callback){
        eachfn(arr, function(x, callback){
            iterator(x, function(result){
                if(result) main_callback(x);
                else callback();
            });
        }, function(err){
            main_callback();
        });
    };
    exports.detect = doParallel(_detect);
    exports.detectSeries = doSeries(_detect);

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
    // any alias
    exports.any = exports.some;

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
    // all alias
    exports.all = exports.every;

    exports.sortBy = function(arr, iterator, callback){
        exports.map(arr, function(x, callback){
            iterator(x, function(err, criteria){
                if(err) callback(err);
                else callback(null, {value: x, criteria: criteria});
            });
        }, function(err, results){
            if(err) return callback(err);
            else callback(null, _map(results.sort(function(left, right){
                var a = left.criteria, b = right.criteria;
                return a < b ? -1 : a > b ? 1 : 0;
            }), function(x){return x.value;}));
        })
    };

    exports.auto = function(tasks, callback){
        callback = callback || function(){};
        var keys = _keys(tasks);
        if(!keys.length) return callback(null);

        var completed = [];

        var listeners = [];
        var addListener = function(fn){
            listeners.unshift(fn);
        };
        var removeListener = function(fn){
            for(var i=0; i<listeners.length; i++){
                if(listeners[i] === fn){
                    listeners.splice(i, 1);
                    return;
                }
            }
        };
        var taskComplete = function(){
            _forEach(listeners, function(fn){fn();});
        };

        addListener(function(){
            if(completed.length == keys.length){
                callback(null);
            }
        });

        _forEach(keys, function(k){
            var task = (tasks[k] instanceof Function)? [tasks[k]]: tasks[k];
            var taskCallback = function(err){
                if(err){
                    callback(err);
                    // stop subsequent errors hitting callback multiple times
                    callback = function(){};
                }
                else {
                    completed.push(k);
                    taskComplete();
                }
            };
            var requires = task.slice(0, Math.abs(task.length-1)) || [];
            var ready = function(){
                return _reduce(requires, function(a,x){
                    return (a && _indexOf(completed, x) != -1);
                }, true);
            };
            if(ready()) task[task.length-1](taskCallback);
            else {
                var listener = function(){
                    if(ready()){
                        removeListener(listener);
                        task[task.length-1](taskCallback);
                    }
                };
                addListener(listener);
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
                    _nextTick(function(){iterator.apply(null, args);});
                }
            };
        };
        wrapIterator(exports.iterator(tasks))();
    };

    exports.parallel = function(tasks, callback){
        callback = callback || function(){};
        exports.map(tasks, function(fn, callback){
            if(fn){
                fn(function(err){
                    var args = Array.prototype.slice.call(arguments,1);
                    if(args.length <= 1) args = args[0];
                    callback.call(null, err, args || null);
                });
            }
        }, callback);
    };

    exports.series = function(tasks, callback){
        callback = callback || function(){};
        exports.mapSeries(tasks, function(fn, callback){
            if(fn){
                fn(function(err){
                    var args = Array.prototype.slice.call(arguments,1);
                    if(args.length <= 1) args = args[0];
                    callback.call(null, err, args || null);
                });
            }
        }, callback);
    };

    exports.iterator = function(tasks){
        var makeCallback = function(index){
            var fn = function(){
                if(tasks.length) tasks[index].apply(null, arguments);
                return fn.next();
            };
            fn.next = function(){
                return (index < tasks.length-1)? makeCallback(index+1): null;
            };
            return fn;
        };
        return makeCallback(0);
    };

    exports.apply = function(fn){
        var args = Array.prototype.slice.call(arguments, 1);
        return function(){
            fn.apply(null, args.concat(Array.prototype.slice.call(arguments)));
        };
    };

})((typeof exports == 'undefined') ? this['async']={}: exports);
