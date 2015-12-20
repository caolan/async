'use strict';
var eachModule = require('./each-module');
eachModule(['git-up',
           'git add .',
           'git commit -m "bumped new version"',
           'git push origin master --force',
           ]);
eachModule(['npm publish']);
