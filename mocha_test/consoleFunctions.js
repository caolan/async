var async = require('../lib');
var expect = require('chai').expect;

describe('console functions', function() {

    var names = [
        'log',
        'dir',
        /* 'info'
        'warn'
        'error' */
    ];

    // generates tests for console functions such as async.log
    names.forEach(function(name) {
        if (typeof console !== 'undefined') {
            it(name, function(done) {
                var fn = function(arg1, callback){
                    expect(arg1).to.equal('one');
                    setTimeout(function(){callback(null, 'test');}, 0);
                };
                var fn_err = function(arg1, callback){
                    expect(arg1).to.equal('one');
                    setTimeout(function(){callback('error');}, 0);
                };
                var _console_fn = console[name];
                var _error = console.error;
                console[name] = function(val){
                    expect(val).to.equal('test');
                    expect(arguments.length).to.equal(1);
                    console.error = function(val){
                        expect(val).to.equal('error');
                        console[name] = _console_fn;
                        console.error = _error;
                        done();
                    };
                    async[name](fn_err, 'one');
                };
                async[name](fn, 'one');
            });

            it(name + ' with multiple result params', function(done) {
                var fn = function(callback){callback(null,'one','two','three');};
                var _console_fn = console[name];
                var called_with = [];
                console[name] = function(x){
                    called_with.push(x);
                };
                async[name](fn);
                expect(called_with).to.eql(['one','two','three']);
                console[name] = _console_fn;
                done();
            });
        }

        // browser-only test
        if (typeof window !== 'undefined') {
            it(name + ' without console.' + name, function(done) {
                var _console = window.console;
                window.console = undefined;
                var fn = function(callback){callback(null, 'val');};
                var fn_err = function(callback){callback('error');};
                async[name](fn);
                async[name](fn_err);
                window.console = _console;
                done();
            });
        }
    });
});
