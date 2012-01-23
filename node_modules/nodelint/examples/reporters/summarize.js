// example usage:
//
//     $ nodelint path/to/file.js --reporter examples/reporters/summarize.js

var util = require('util');

function reporter(results) {
  var len = results.length;
  util.puts(len + ' error' + ((len === 1) ? '' : 's'));
}
