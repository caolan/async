
// Reporter for working with external tools within the Idea IDEs
// Only tested with RubyMine
// For setup instructions see: https://github.com/tav/nodelint/wiki/Editor-and-IDE-integration

var util = require('util');

function reporter(results) {

  var error_regexp = /^\s*(\S*(\s+\S+)*)\s*$/,
      i,
      len = results.length,
      str = '',
      file,
      error;

  if (len > 0) {
    for (i = 0; i < len; i += 1) {
      file = results[i].file;
      error = results[i].error;

      str += file  + ' ' + error.line +
        ':' + error.character +
        ' ' + error.reason + ' ' +
        (error.evidence || '').replace(error_regexp, "$1");
    }
    util.puts(str);
  }
}
