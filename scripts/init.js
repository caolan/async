'use strict';

var eachModule = require('./each-module');
eachModule(['rm -rf .git ',
            'git init',
            'git remotes add origin git@github.com:async-js/async.<%= name %>.git',
            'git add .',
            'git commit -m "first commit"'
            ]);
