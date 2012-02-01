// example usage:
//
//     $ nodelint path/to/file.js --reporter examples/reporters/xml.js
//
// this reporter produces jslint xml that can be automatically recognised by
// Hudson Violations Plugin http://wiki.hudson-ci.org/display/HUDSON/Violations+Plugin

var path = require('path'),
    util = require('util');

function reporter(results) {

  function escape(str) {
    return (str) ? str.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') : '';
  }

  var i, error, len, file,
      dir = process.cwd(),
      xml = '<?xml version="1.0" encoding="UTF-8" ?>\n<jslint>\n';

  for (i = 0, len = results.length; i < len; i += 1) {
    file = path.join(dir, results[i].file);
    error = results[i].error;
    xml += '\t<file name="' + file + '">\n' +
           '\t\t<issue char="' + error.character + '" evidence="' + escape(error.evidence || '') +
           '" line="' + error.line + '" reason="' + escape(error.reason) + '"/>\n' +
           '\t</file>\n';
  }

  xml += '</jslint>';
  util.puts(xml);

}
