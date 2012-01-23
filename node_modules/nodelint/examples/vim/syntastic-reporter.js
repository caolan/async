
// Reporter for working with the vim syntastic plugin
// See http://gist.github.com/629349 for the vim script

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

      str += file  + 'line ' + error.line +
        ' column ' + error.character +
        ' Error: ' + error.reason + ' ' +
        (error.evidence || '').replace(error_regexp, "$1");

      str += (i === len - 1) ? '' : '\n';
    }
    util.puts(str);
  }
}
