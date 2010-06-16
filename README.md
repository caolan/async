# Async
_Higher-order functions and common patterns for asynchronous code in node.js_

I've so far avoided using the existing async modules in favour of the standard
callbacks provided by node. When writing modules, I find sticking to the
convention of using a single callback makes the API easier to understand, and
allows people to wrap the module with other methods of handling async code if
they so wish.

However, I've found myself repeating a number of patterns, so I've decided to
abstract some of the more common ones into a separate module. What I've ended
up with is a few higher-order functions that operate on async code using the
convention of a single callback. This includes the usual 'functional'
suspects (map, reduce, filter, forEach...) as well as some common patterns
for running blocks of async code (parallel, series, waterfall...).

__This is not an attempt to replace the standard callback mechanism in
node.__ In fact, it is designed to work as seamlessly as possible with the
existing node modules, and any other module which follows those conventions.
If you're interested in other ways to manage async code, then you may like
to take a look at the new implementation of the old node Promise objects or
alternative modules like node-continuables.


## API

### Collections

* __forEach (forEachSeries)__ - Applies an async iterator to each item in an
  array.
* __map (mapSeries)__ - Produces a new array of values by mapping each value
  in the given array through an async iterator function.
* __filter (filterSeries)__ - Returns a new array of all the values which pass
  an async truth test.
* __reject (rejectSeries)__ - The opposite of filter, removes items that
  passes an async test.
* __reduce (reduceRight)__ - Reduces a list of values into a single value
  using an async iterator to return each successive step.
* __detect (detectSeries)__ - Returns the first value is a list that passes an
  async truth test.
* __sortBy__ - Sorts a list by the results of running each value through an
  async iterator, leaving the original values intact.
* __some__ - Returns true if at least one element in the array satisfies an
  async test.
* __every__ - Returns true if every element in the array satisfies an async
  test.

### Flow Control

* __series__ - Run an array of functions in series, each one running once the
  previous function has completed.
* __parallel__ - Run an array of functions in parallel, without waiting until
  the previous function has completed.
* __waterfall__ - Runs an array of functions in series, each passing their
  results to the next in the array.
* __auto__ - Determines the best order for running functions based on their
  requirements.
* __iterator__ - Creates an iterator function which calls the next function in
  the array, returning a continuation to call the next one after that.


## Collections

### forEach(arr, iterator, callback)

Applies an iterator function to each item in an array, in parallel.
The iterator is called with an item from the list and a callback for when it
has finished. If the iterator passes an error to this callback, the main
callback for the forEach function is immediately called with the error.

Note, that since this function applies the iterator to each item in parallel
there is no guarantee that the iterator functions will complete in order.

__Arguments__

* arr - An array to iterate over.
* iterator(item, callback) - A function to apply to each item in the array.
  The iterator is passed a callback which must be called once it has completed.
* callback(err) - A callback which is called after all the iterator functions
  have finished, or an error has occurred.

__Example__

    // assuming openFiles is an array of file names and saveFile is a function
    // to save the modified contents of that file:

    async.forEach(openFiles, saveFile, function(err){
        // if any of the saves produced an error, err would equal that error
    });

### forEachSeries(arr, iterator, callback)

The same as forEach only the iterator is applied to each item in the array in
series. The next iterator is only called once the current one has completed
processing. This means the iterator functions will complete in order.


### map(arr, iterator, callback)

Produces a new array of values by mapping each value in the given array through
the iterator function. The iterator is called with an item from the array and a
callback for when it has finished processing. The callback takes 2 arguments, 
an error and the transformed item from the array. If the iterator passes an
error to this callback, the main callback for the map function is immediately
called with the error.

Note, that since this function applies the iterator to each item in parallel
there is no guarantee that the iterator functions will complete in order, however
the results array will be in the same order as the original array.

__Arguments__

* arr - An array to iterate over.
* iterator(item, callback) - A function to apply to each item in the array.
  The iterator is passed a callback which must be called once it has completed
  with an error (which can be null) and a transformed item.
* callback(err, results) - A callback which is called after all the iterator
  functions have finished, or an error has occurred. Results is an array of the
  transformed items from the original array.

__Example__

    async.map(['file1','file2','file3'], fs.stat, function(err, results){
        // results is now an array of stats for each file
    });

### mapSeries(arr, iterator, callback)

The same as map only the iterator is applied to each item in the array in
series. The next iterator is only called once the current one has completed
processing. The results array will be in the same order as the original.


### filter(arr, iterator, callback)

__Alias:__ select

Returns a new array of all the values which pass an async truth test.
_The callback for each iterator call only accepts a single argument of true or
false, it does not accept an error argument first!_ This is inline with the
way node libraries work with truth tests like path.exists. This operation is
performed in parallel, but the results array will be in the same order as the
original.

__Arguments__

* arr - An array to iterate over.
* iterator(item, callback) - A truth test to apply to each item in the array.
  The iterator is passed a callback which must be called once it has completed.
* callback(results) - A callback which is called after all the iterator
  functions have finished.

__Example__

    async.filter(['file1','file2','file3'], path.exists, function(results){
        // results now equals an array of the existing files
    });

### filterSeries(arr, iterator, callback)

__alias:__ selectSeries

The same as filter only the iterator is applied to each item in the array in
series. The next iterator is only called once the current one has completed
processing. The results array will be in the same order as the original.

### reject(arr, iterator, callback)

The opposite of filter. Removes values that pass an async truth test.

### rejectSeries(arr, iterator, callback)

The same as filter, only the iterator is applied to each item in the array
in series.


### reduce(arr, memo, iterator, callback)

__aliases:__ inject, foldl

Reduces a list of values into a single value using an async iterator to return
each successive step. Memo is the initial state of the reduction. This
function only operates in series. For performance reasons, it may make sense to
split a call to this function into a parallel map, then use the normal
Array.prototype.reduce on the results. This function is for situations where
each step in the reduction needs to be async, if you can get the data before
reducing it then its probably a good idea to do so.

__Arguments__

* arr - An array to iterator over.
* memo - The initial state of the reduction.
* iterator(memo, item, callback) - A function applied to each item in the
  array to produce the next step in the reduction. The iterator is passed a
  callback which accepts an optional error as its first argument, and the state
  of the reduction as the second. If an error is passed to the callback, the
  reduction is stopped and the main callback is immediately called with the
  error.
* callback(err, result) - A callback which is called after all the iterator
  functions have finished. Result is the reduced value.

__Example__

    async.reduce([1,2,3], 0, function(memo, item, callback){
        // pointless async:
        process.nextTick(function(){
            callback(null, memo + item)
        });
    }, function(err, result){
        // result is now equal to the last value of memo, which is 6
    });

### reduceRight(arr, memo, iterator, callback)

__Alias:__ foldr

Same as reduce, only operates on the items in the array in reverse order.


### detect(arr, iterator, callback)

Returns the first value in a list that passes an async truth test. The
iterator is applied in parallel, meaning the first iterator to return true will
fire the detect callback with that result. That means the result might not be
the first item in the original array (in terms of order) that passes the test.

If order within the original array is important then look at detectSeries.

__Arguments__

* arr - An array to iterator over.
* iterator(item, callback) - A truth test to apply to each item in the array.
  The iterator is passed a callback which must be called once it has completed.
* callback(result) - A callback which is called as soon as any iterator returns
  true, or after all the iterator functions have finished. Result will be
  the first item in the array that passes the truth test (iterator) or the
  value undefined if none passed.

__Example__

    async.detect(['file1','file2','file3'], path.exists, function(result){
        // result now equals the first file in the list that exists
    });

### detectSeries(arr, iterator, callback)

The same as detect, only the iterator is applied to each item in the array
in series. This means the result is always the first in the original array (in
terms of array order) that passes the truth test.


### sortBy(arr, iterator, callback)

Sorts a list by the results of running each value through an async iterator.

__Arguments__

* arr - An array to iterate over.
* iterator(item, callback) - A function to apply to each item in the array.
  The iterator is passed a callback which must be called once it has completed
  with an error (which can be null) and a value to use as the sort criteria.
* callback(err, results) - A callback which is called after all the iterator
  functions have finished, or an error has occurred. Results is the items from
  the original array sorted by the values returned by the iterator calls.

__Example__

    async.sortBy(['file1','file2','file3'], function(file, callback){
        fs.stat(file, function(err, stats){
            callback(err, stats.mtime);
        });
    }, function(err, results){
        // results is now the original array of files sorted by
        // modified date
    });


### some(arr, iterator, callback)

__Alias:__ any

Returns true if at least one element in the array satisfies an async test.
_The callback for each iterator call only accepts a single argument of true or
false, it does not accept an error argument first!_ This is inline with the
way node libraries work with truth tests like path.exists. Once any iterator
call returns true, the main callback is immediately called.

__Arguments__

* arr - An array to iterator over.
* iterator(item, callback) - A truth test to apply to each item in the array.
  The iterator is passed a callback which must be called once it has completed.
* callback(result) - A callback which is called as soon as any iterator returns
  true, or after all the iterator functions have finished. Result will be
  either true or false depending on the values of the async tests.

__Example__

    async.some(['file1','file2','file3'], path.exists, function(result){
        // if result is true then at least one of the files exists
    });

### every(arr, iterator, callback)

__Alias:__ all

Returns true if every element in the array satisfies an async test.
_The callback for each iterator call only accepts a single argument of true or
false, it does not accept an error argument first!_ This is inline with the
way node libraries work with truth tests like path.exists.

__Arguments__

* arr - An array to iterator over.
* iterator(item, callback) - A truth test to apply to each item in the array.
  The iterator is passed a callback which must be called once it has completed.
* callback(result) - A callback which is called after all the iterator
  functions have finished. Result will be either true or false depending on
  the values of the async tests.

__Example__

    async.every(['file1','file2','file3'], path.exists, function(result){
        // if result is true then every file exists
    });


## Flow Control

### series(tasks, [callback])

Run an array of functions in series, each one running once the previous
function has completed. If any functions in the series pass an error to its
callback, no more functions are run and the callback for the series is
immediately called with the value of the error.

__Arguments__

* tasks - An array of functions to run, each function is passed a callback it
  must call on completion.
* callback(err, results) - An optional callback to run once all the functions
  have completed. This function gets an array of all the arguments passed to
  the callbacks used in the array.

__Example__

    async.series([
        function(callback){
            // do some stuff ...
            callback(null, 'one');
        },
        function(callback){
            // do some more stuff ...
            callback(null, 'two');
        },
    ],
    // optional callback
    function(err, results){
        // results is now equal to ['one', 'two']
    });


### parallel(tasks, [callback])

Run an array of functions in parallel, without waiting until the previous
function has completed. If any of the functions pass an error to its
callback, the main callback is immediately called with the value of the error.

__Arguments__

* tasks - An array of functions to run, each function is passed a callback it
  must call on completion.
* callback(err, results) - An optional callback to run once all the functions
  have completed. This function gets an array of all the arguments passed to
  the callbacks used in the array.

__Example__

    async.parallel([
        function(callback){
            setTimeout(function(){
                callback(null, 'one');
            }, 200);
        },
        function(callback){
            setTimeout(function(){
                callback(null, 'two');
            }, 100);
        },
    ],
    // optional callback
    function(err, results){
        // in this case, the results array will equal ['two','one']
        // because the functions were run in parallel and the second
        // function had a shorter timeout before calling the callback.
    });


### waterfall(tasks, [callback])

Runs an array of functions in series, each passing their results to the next in
the array. However, if any of the functions pass an error to the callback, the
next function is not executed and the main callback is immediately called with
the error.

__Arguments__

* tasks - An array of functions to run, each function is passed a callback it
  must call on completion.
* callback(err) - An optional callback to run once all the functions have
  completed. This function gets passed any error that may have occurred.

__Example__

    async.waterfall([
        function(callback){
            callback(null, 'one', 'two');
        }
        function(arg1, arg2, callback){
            callback(null, 'three');
        }
        function(arg1, callback){
            // arg1 now equals 'three'
            callback(null, 'done');
        }
    ]);


### auto(tasks, [callback])

Determines the best order for running functions based on their requirements.
Each function can optionally depend on other functions being completed first,
and each function is run as soon as its requirements are satisfied. If any of
the functions pass and error to their callback, that function will not complete
(so any other functions depending on it will not run) and the main callback
will be called immediately with the error.

__Arguments__

* tasks - An object literal containing named functions or an array of
  requirements, with the function itself the last item in the array. The key
  used for each function or array is used when specifying requirements. The
  sytax is easier to understand by looking at the example.
* callback(err) - An optional callback which is called when all the tasks have
  been completed. The callback may recieve an error as an argument.

__Example__

    async.auto({
        get_data: function(callback){
            // async code to get some data
        },
        make_folder: function(callback){
            // async code to create a directory to store a file in
            // this is run at the same time as getting the data
        },
        write_file: ['get_data', 'make_folder', function(callback){
            // once there is some data and the directory exists,
            // write the data to a file in the directory
        }],
        email_link: ['write_file', function(callback){
            // once the file is written let's email a link to it...
        }]
    });

This is a fairly trivial example, but to do this using the basic parallel and
series functions would look like this:

    async.parallel([
        function(callback){
            // async code to get some data
        },
        function(callback){
            // async code to create a directory to store a file in
            // this is run at the same time as getting the data
        }
    ],
    function(results){
        async.series([
            function(callback){
                // once there is some data and the directory exists,
                // write the data to a file in the directory
            },
            email_link: ['write_file', function(callback){
                // once the file is written let's email a link to it...
            }
        ]);
    });

For a complicated series of async tasks using the auto function makes adding
new tasks much easier and makes the code more readable. 


### iterator(tasks)

Creates an iterator function which calls the next function in the array,
returning a continuation to call the next one after that. Its also possible to
'peek' the next iterator by doing iterator.next().

This function is used internally by the async module but can be useful when
you want to manually control the flow of functions in series.

__Arguments__

* tasks - An array of functions to run, each function is passed a callback it
  must call on completion.

__Example__

    var iterator = async.iterator([
        function(){ sys.p('one'); },
        function(){ sys.p('two'); },
        function(){ sys.p('three'); }
    ]);

    node> var iterator2 = iterator();
    'one'
    node> var iterator3 = iterator2();
    'two'
    node> iterator3();
    'three'
    node> var nextfn = iterator2.next();
    node> nextfn();
    'three'


