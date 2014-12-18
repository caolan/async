#!/usr/bin/env node

// This should probably be its own module but complaints about bower/etc.
// support keep coming up and I'd rather just enable the workflow here for now
// and figure out where this should live later. -- @beaugunderson

var fs = require('fs');
var _ = require('lodash');

var packageJson = require('../package.json');

var IGNORES = ['**/.*', 'node_modules', 'bower_components', 'test', 'tests'];
var INCLUDES = ['lib/async.js', 'README.md', 'LICENSE'];
var REPOSITORY_NAME = 'caolan/async';

var LICENSE_NAME = packageJson.license.type;

packageJson.jam = {
  main: packageJson.main,
  include: INCLUDES,
  categories: ['Utilities']
};

packageJson.spm = {
  main: packageJson.main
};

packageJson.volo = {
  main: packageJson.main,
  ignore: IGNORES
};

var bowerSpecific = {
  moduleType: ['amd', 'globals', 'node'],
  license: LICENSE_NAME,
  ignore: IGNORES,
  authors: [packageJson.author]
};

var bowerInclude = ['name', 'description', 'version', 'main', 'keywords',
  'homepage', 'repository', 'devDependencies'];

var componentSpecific = {
  license: LICENSE_NAME,
  repository: REPOSITORY_NAME,
  scripts: [packageJson.main]
};

var componentInclude = ['name', 'description', 'version', 'keywords'];

var bowerJson = _.merge({}, _.pick(packageJson, bowerInclude), bowerSpecific);
var componentJson = _.merge({}, _.pick(packageJson, componentInclude), componentSpecific);

fs.writeFileSync('./bower.json', JSON.stringify(bowerJson, null, 2));
fs.writeFileSync('./component.json', JSON.stringify(componentJson, null, 2));
fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));
