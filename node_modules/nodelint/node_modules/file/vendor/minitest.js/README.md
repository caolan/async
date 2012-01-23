# About

Simple test framework for asynchronous testing in [Node.js](http://nodejs.org/). It's trying to be as simple and explicit as possible. No magic, no wheel reinventing. Just use minitest for building your tests and the [assert library](http://nodejs.org/api.html#assert-212) for the actual helpers for testing equality etc.

This is how the output looks like:

![Minitest.js output](http://github.com/botanicus/minitest.js/raw/master/minitest.png)

# Setup

* `require()` minitest
* Use `minitest.setupListeners()` for listening on the `uncaughtException` and `exit` events.
* Use `minitest.context(description, block)` for defining your contexts. Context will be usually a function or object name.
* Use `#<a Context>.assertion(description, block)` for defining your assertions.
* Use `#<a Test>.finished()` to mark test as finished. All the tests has to have it. Without this you won't be able to write solid asynchronous tests, because you can't ask only "is a and b the same?", but also "did the callback run?".
* Run `node foo_test.js` to get the results.

# Example

    var minitest = require("minitest");
    var assert   = require("assert");

    minitest.setupListeners();
  
    minitest.context("Context#setup()", function () {
      this.setup(function () {
        this.user = {name: "Jakub"};
      });

      this.assertion("it should setup listeners", function (test) {
        // test something via the standard assert module
        assert.ok(this.user)

        // mark test as finished
        test.finished();
      });

      this.assertion("it should be able to count", function (test) {
        if (2 !== 4) {
          // manually fail the test
          throw new Error("You can't count, can you?");
        };
      });
    });

## Formatters

If you don't like minitest output, you can simply override following methods:

* `Context.prototype.contextHeader()`
* `Test.prototype.reportSuccess()`
* `Test.prototype.reportError(error)`
* `Test.prototype.reportNotRun()`

All this methods are supposed to return a string and all these methods have access to `this.description`.

# Common Problems in Testing Asynchronous Code

## Exceptions in Callbacks

Obviously you can't catch errors which occured in callbacks. Consider following:

    try {
      db.get("botanicus", function (user) {
        throw new Error("You can't catch me!");
      });
    } catch(error) {
      // you'll never get in here
    };

## Testing Exceptions

    this.assertion("should throw an error", function (test) {
      assert.throws(function () {
        throw new Error("Error occured!");
        test.finished();
      });
    });

This obviously can't work, because exception interrupts the anonymous function we are passing as an argument for `assert.throws()`.

    this.assertion("should throw an error", function (test) {
      assert.throws(function () {
        throw new Error("Error occured!");
      });
      test.finished();
    });

This is better, it will at least work, but what if there will be an error in the `assert.throws()` function and it doesn't call the anonymous function?

    this.assertion("should throw an error", function (test) {
      assert.throws(function () {
        test.finished();
        throw new Error("Error occured!");
      });
    });

OK, this is better, `test.finished()` doesn't jump out of the test, so in case that the assertion will fail, we will get the proper result. However it's not perfect, because I can change `test.finished()` in future to actually jump out of the function (I probably won't do that but you can't know) plus if there would be a bug, so `test.finished()` would cause an exception, it would satisfy `assert.throws()` without actually testing the code. Well, you'd probably noticed in other tests, but still.

Fortunatelly you can specify error class and expected message for `assert.throws()` in this order: `assert.throws(block, error, message)`.
