var fs = require('fs');
var path = require('path');
var jsp = require("uglify-js").parser;
var pro = require("uglify-js").uglify;

var orig_code = fs.readFileSync(path.join(__dirname, './lib/async.js'), 'utf8');
var ast = jsp.parse(orig_code); // parse code and get the initial AST
ast = pro.ast_mangle(ast); // get a new AST with mangled names
ast = pro.ast_squeeze(ast); // get an AST with compression optimizations
var final_code = pro.gen_code(ast); // compressed code here
fs.writeFileSync(path.join(__dirname, './dist/async.min.js'), final_code, 'utf8');