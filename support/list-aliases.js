#!/usr/bin/env node
const path = require('path')
const yargs = require('yargs')
const aliases = require('./aliases')

const argv = yargs
    .option('sources', {
        type: 'boolean',
        default: false
    })
    .argv

const prefix = argv._[0] || 'build-es/'

const targets = Object.keys(aliases).map(argv.sources ? expandSource : expandAlias)
process.stdout.write(targets.join(' '))


function expandAlias (alias) {
    return path.join(prefix, `${alias}.js`)
}

function expandSource (alias) {
    return path.join(prefix, `${aliases[alias]}.js`)
}
