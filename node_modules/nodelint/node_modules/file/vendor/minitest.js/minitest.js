var sys = require("sys");
var colours = require("./colours");

/* suite */
function Suite () {
  this.contexts = [];
};

Suite.prototype.report = function () {
  var suite = this;
  this.contexts.forEach(function(context, index) {
    sys.puts(context.contextHeader());
    context.report();
    if (suite.contexts.length === index) {
      sys.puts("");
    };
  });
};

Suite.prototype.register = function (context) {
  this.contexts.push(context);
};

// there is only one suite instance
var suite = exports.suite = new Suite();

/* context */
function Context (description, block) {
  this.tests = [];
  this.block = block;
  this.description = description;
};

Context.prototype.run = function () {
  this.block.call(this);
};

Context.prototype.register = function (test) {
  this.tests.push(test);
};

Context.prototype.report = function () {
  this.tests.forEach(function (test) {
    test.report();
  });
};

/* test */
function Test (description, block, setupBlock) {
  this.description = description;
  this.block = block;
  this.setupBlock = setupBlock;
};

Test.prototype.run = function () {
  try {
    if (this.setupBlock) {
      this.setupBlock.call(this);
    };

    this.block.call(this, this);
  } catch(error) {
    this.failed(error);
  };
};

Test.prototype.finished = function () {
  this.result = this.reportSuccess();
};

Test.prototype.failed = function (error) {
  this.result = this.reportError(error);
};

Test.prototype.report = function () {
  if (this.result) {
    sys.puts(this.result);
  } else {
    sys.puts(this.reportNotFinished());
  };
};

/* output formatters */
Context.prototype.contextHeader = function () {
  return colours.bold.yellow + "[= " + this.description + " =]" + colours.reset;
};

Test.prototype.reportSuccess = function () {
  // return colours.bold.green + "  ✔ OK: " + colours.reset + this.description;
  return colours.bold.green + "  OK: " + colours.reset + this.description;
};

Test.prototype.reportError = function (error) {
  var stack = error.stack.replace(/^/, "    ");
  // return colours.bold.red + "  ✖ Error: " + colours.reset + this.description + "\n" + stack;
  return colours.bold.red + "  Error: " + colours.reset + this.description + "\n" + stack;
};

Test.prototype.reportNotFinished = function () {
  // return colours.bold.magenta + "  ✖ Didn't finished: " + colours.reset + this.description;
  return colours.bold.magenta + "  Didn't finished: " + colours.reset + this.description;
};

/* DSL */
function context (description, block) {
  var context = new Context(description, block);
  suite.register(context);
  context.run();
};

/*
  Run an example and print if it was successful or not.

  @example
    minitest.context("setup()", function () {
      this.assertion("Default value should be 0", function (test) {
        assert.equal(value, 0);
        test.finished();
      });
    });
*/
Context.prototype.assertion = function (description, block) {
  var test = new Test(description, block, this.setupBlock);
  this.register(test);
  test.run();
};

Context.prototype.setup = function (block) {
  this.setupBlock = block;
};

function runAtExit () {
  process.addListener("exit", function () {
    suite.report();
  });
};

function setupUncaughtExceptionListener () {
  // TODO: is there any way how to get the test instance,
  // so we could just set test.result, so everything would be
  // reported properly on the correct place, not in the middle of tests
  process.addListener("uncaughtException", function (error) {
    sys.puts(Test.prototype.reportError(error));
  });
};

function setupListeners () {
  setupUncaughtExceptionListener();
  runAtExit();
};

/* exports */
exports.Context = Context;
exports.Test = Test;
exports.context = context;
exports.runAtExit = runAtExit;
exports.setupUncaughtExceptionListener = setupUncaughtExceptionListener;
exports.setupListeners = setupListeners;
