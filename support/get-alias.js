#!/usr/bin/env node
const path = require('path')
const aliases = require('./aliases.json')

const toAlias = process.argv[2]
const baseName = path.basename(toAlias, '.js')

const alias = aliases[baseName] || baseName

process.stdout.write(toAlias
    .replace(/^[^/]+\//, 'lib/')
    .replace(baseName, alias))
