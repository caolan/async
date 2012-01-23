// example usage:
//
//     $ nodelint path/to/file.js --reporter examples/reporters/elaborate.js

var util = require('util');

function reporter(results) {

  var error_regexp = /^\s*(\S*(\s+\S+)*)\s*$/,
      i,
      len = results.length,
      str = '',
      file,
      error;

  for (i = 0; i < len; i += 1) {
    file = results[i].file;
    file = file.substring(file.lastIndexOf('/') + 1, file.length);
    error = results[i].error;
    str += file  + ': line ' + error.line +
      ', character ' + error.character + ', ' +
      error.reason + '\n' +
      (error.evidence || '').replace(error_regexp, "$1") + '\n';
  }

  if (len > 0) {
    str += len + ' error' + ((len === 1) ? '' : 's');
    util.error(str);
  } else {
    util.puts('Lint free!');
  }

}
