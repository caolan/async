nodelint(1) -- Run JSLint from the command-line under node.js
=============================================================

## SYNOPSIS

    nodelint [options] <file-or-directory> [<file-or-directory> ...]

## DESCRIPTION

The nodelint command-line tool allows you to check for problems and ensure  
the code quality of your JavaScript files using JSLint.

It is completely extensible so you can use your own custom JSLint config or  
even use custom reporters that better integrate with your quality assurance  
framework.

## OPTIONS

  __--reporter FILE__:  
      Override the default reporter with your own custom module. See  
      the *examples/reporters* directory for custom reporters that come  
      bundled with nodelint.

  __--config FILE__:  
      Override the default *config.js* with your own config file.

  __-h__, __--help__:  
      Display the help and exit.

  __-v__, __--version__:  
      Output version information and exit.

  __<file-or-directory>__:
      You can run nodelint on specific files or on all *\*.js* files inside  
      a directory.

## CONFIG

You can customise the JSLint options by modifying the default config.js  
file or by providing your own config file with the *--config* parameter:

    nodelint --config path/to/custom.js file1.js file2.js ...

For example, if the default config.js looks like:

    var options = {
        adsafe       : false,
        bitwise      : true,
        error_prefix : "\u001b[1m",
        error_suffix : ":\u001b[0m "
    };

And your custom.js looks like:

    var options = {
        bitwise      : false,
        browser      : false
    };

Then the final options will be:

    var options = {
        adsafe       : false,
        bitwise      : false,
        browser      : false,
        error_prefix : "\u001b[1m",
        error_suffix : ":\u001b[0m "
    };

## JSLINT OPTIONS

  * adsafe:  
    True if ADsafe  rules should be enforced. See http://www.ADsafe.org/.
  * bitwise:  
    True if bitwise operators should not be allowed.
  * browser:  
    True if the standard browser globals should be predefined.
  * cap:  
    True if upper case HTML should be allowed.
  * css:  
    True if CSS workarounds should be tolerated.
  * debug:  
    True if debugger statements should be allowed.  
    Set this option to false before going into production.
  * devel:  
    True if browser globals that are useful in development  
    (console, alert, ...) should be predefined.
  * eqeqeq:  
    True if === should be required.
  * es5:  
    True if ES5 syntax should be allowed.
  * evil:  
    True if eval should be allowed.
  * forin:  
    True if unfiltered for in statements should be allowed.
  * fragment:  
    True if HTML fragments should be allowed.
  * immed:  
    True if immediate function invocations must be wrapped in parens
  * indent:  
    The number of spaces used for indentation (default is 4)
  * laxbreak:  
    True if statement breaks should not be checked.
  * maxerr:  
    The maximum number of warnings reported (default is 50)
  * maxlen:  
    The maximum number of characters in a line
  * nomen:  
    True if names should be checked for initial or trailing underbars
  * newcap:  
    True if Initial Caps must be used with constructor functions.
  * on:  
    True if HTML event handlers should be allowed.
  * onevar:  
    True if only one var statement per function should be allowed.
  * passfail:  
    True if the scan should stop on first error.
  * plusplus:  
    True if ++ and -- should not be allowed.
  * predef:  
    An array of strings (comma separated), the names of predefined global variables.  
    predef is used with the option object, but not with the /*jslint */ comment.  
    Use the var statement to declare global variables in a script file.
  * regexp:  
    True if . and [^...] should not be allowed in RegExp literals.  
    These forms should not be used when validating in secure applications.
  * rhino:  
    True if the Rhino environment globals should be predefined.
  * safe:  
    True if the safe subset rules are enforced. These rules are used by ADsafe.  
    It enforces the safe subset rules but not the widget structure rules.
  * strict:  
    True if the ES5 "use strict"; pragma is required. Do not use this option carelessly.
  * sub:  
    True if subscript notation may be used for expressions better expressed in dot notation.
  * undef:  
    True if variables must be declared before used.
  * white:  
    True if strict whitespace rules apply.
  * widget:  
    True if the Yahoo Widgets globals should be predefined.
  * windows:  
    True if the Windows globals should be predefined.


## AUTHORS

Written by Tav and other nodelint contributors.  
Contributors list: <https://github.com/tav/nodelint/contributors>.

## REPORTING BUGS

Report nodelint bugs to <https://github.com/tav/nodelint/issues>.

## COPYRIGHT

Nodelint has been released into the Public Domain by its Authors.

## SEE ALSO

node(1)

