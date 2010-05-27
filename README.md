# Async
_Commonly used patterns for asynchronous code in node.js_

Writing an async library has become a bit of a right of passage for node.js
developers. There are already lots of interesting ideas out there and I 
don't want to add to this myriad of already great modules. Really. Its just
that I like my Javascript to look like Javascript, and when I'm using node.js,
I want to stay fairly close to the vanilla async implementation.

Because of this, I've avoided using the exising async wrapper modules in favour
of the standard callbacks provided by node. However, I've found myself
repeating a number of patterns, so I've decided to abstract some of the more
common ones into a separate module. __This is not an attempt to replace the
standard callback mechanism in node.js.__ Its just some utility functions for
writing async code, sticking as closely as possible the node's normal
callbacks. The aim is to play nicely with node's existing async functions, and
provide some higher-order functions that work when writing async code.


## Collections

Not yet documented.


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
        },
        email_link: ['write_file', function(callback){
            // once the file is written let's email a link to it...
        }
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


