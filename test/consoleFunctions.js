var async = require('../lib');
var {expect} = require('chai');

describe('console functions', () => {

    var names = [
        'log',
        'dir',
        /* 'info'
        'warn'
        'error' */
    ];

    // generates tests for console functions such as async.log
    names.forEach((name) => {
        if (typeof console !== 'undefined') {
            it(name, (done) => {
                var fn = function(arg1, callback){
                    expect(arg1).to.equal('one');
                    setTimeout(() => {callback(null, 'test');}, 0);
                };
                var fn_err = function(arg1, callback){
                    expect(arg1).to.equal('one');
                    setTimeout(() => {callback('error');}, 0);
                };
                var _console_fn = console[name];
                var _error = console.error;
                console[name] = function(val, ...extra){
                    expect(val).to.equal('test');
                    expect(extra.length).to.equal(0);
                    console.error = function(errVal){
                        expect(errVal).to.equal('error');
                        console[name] = _console_fn;
                        console.error = _error;
                        done();
                    };
                    async[name](fn_err, 'one');
                };
                async[name](fn, 'one');
            });

            it(name + ' with multiple result params', (done) => {
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
            it(name + ' without console.' + name, (done) => {
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
