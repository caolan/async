var spawn = require('child_process').spawn;

var node_deprecated_warning = "The \"sys\" module is now called \"util\". "
                              + "It should have a similar interface.\n";

exports.Node2SpaceIndent = function (test) {
  test.expect(2);

  var
    child = spawn('./nodelint', [__dirname + '/fixtures/node-2-space-indent.js']),
    stdout_output = '',
    stderr_output = '';

  child.stdout.addListener('data', function (data) {
    stdout_output += data;
  });

  child.stderr.addListener('data', function (data) {
    stderr_output += data;
  });

  child.addListener('exit', function (code) {
    stderr_output = stderr_output.replace(node_deprecated_warning, "");

    test.equal(code, 0, 'node-2-space-indent.js ok');
    test.equal(stderr_output, '0 errors\n', 'node-2-space-indent.js passed');
    test.done();
  });
};

exports.Node4SpaceIndent = function (test) {
  test.expect(2);

  var
    child = spawn('./nodelint', [__dirname + '/fixtures/node-4-space-indent.js']),
    stdout_output = '',
    stderr_output = '';

  child.stdout.addListener('data', function (data) {
    stdout_output += data;
  });

  child.stderr.addListener('data', function (data) {
    stderr_output += data;
  });

  child.addListener('exit', function (code) {
    stderr_output = stderr_output.replace(node_deprecated_warning, "");

    test.equal(code, 0, 'node-4-space-indent.js ok');
    test.equal(stderr_output, '0 errors\n', 'node-4-space-indent.js passed');
    test.done();
  });
};

exports.Browser4SpaceIndent = function (test) {
  test.expect(2);

  var
    child = spawn('./nodelint', [__dirname + '/fixtures/browser-4-space-indent.js']),
    stdout_output = '',
    stderr_output = '';

  child.stdout.addListener('data', function (data) {
    stdout_output += data;
  });

  child.stderr.addListener('data', function (data) {
    stderr_output += data;
  });

  child.addListener('exit', function (code) {
    stderr_output = stderr_output.replace(node_deprecated_warning, "");
    
    test.equal(code, 0, 'browser-4-space-indent.js ok');
    test.equal(stderr_output, '0 errors\n', 'browser-4-space-indent.js passed');
    test.done();
  });
};
