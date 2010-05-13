#!/usr/local/bin/node

require.paths.push(__dirname);
require.paths.push(__dirname + '/deps');
require.paths.push(__dirname + '/lib');

try {
    var testrunner = require('nodeunit').testrunner;
}
catch(e) {
    var sys = require('sys');
    sys.puts("Cannot find nodeunit module.");
    sys.puts("You can download submodules for this project by doing:");
    sys.puts("");
    sys.puts("    git submodule init");
    sys.puts("    git submodule update");
    sys.puts("");
    process.exit();
}

process.chdir(__dirname);
testrunner.run(['test']);
