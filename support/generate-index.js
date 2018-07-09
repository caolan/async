#!/usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')
require('babel-core/register')
const autoInject = require('../lib/autoInject').default

generateIndex(err => {
    if (err) throw err
})

function generateIndex(done) {
    autoInject({
        entries: cb => readEntries(cb),
        aliases: cb => loadAliases(cb),
        template: cb => fs.readFile(path.join(__dirname, './index-template.js'), 'utf8', cb),
        generated: (entries, aliases, template, cb) => {
            cb(null, renderTemplate(entries, aliases, template))
        }
    }, (err, results) => {
        if (err) return done(err)
        console.log(results.generated)
        done()
    })
}

function loadAliases (cb) {
    const aliases = {}
    fs.readFileSync(path.join(__dirname, 'aliases.txt'), 'utf8')
        .split('\n')
        .filter(Boolean)
        .forEach(line => {
            const [alias, src] = line.split(' ')
            aliases[alias] = src
        })
    cb(null, aliases)
}

function readEntries (cb) {
    const libDir = path.join(__dirname, '../lib')
    fs.readdir(libDir, (err, files) => {
        if (err) return cb(err)
        cb(null, files
            .map(file => path.basename(file, '.js'))
            .filter(file => !file.match(/(^(index|internal)$)/)))
    })
}

function renderTemplate(entries, aliases, template) {
    return template
        .replace(
            `/*__imports__*/`,
            entries
                .map(entry => `import ${entry} from './${entry}'`)
                .join('\n'))
        .replace(
            `/*__default_object__*/`,
            entries
                .map(entry => `    ${entry}`)
                .join(',\n') + ',')

        .replace(
            `/*__default_aliases__*/`,
            Object.keys(aliases)
                .map(alias => `    ${alias}: ${aliases[alias]}`)
                .join(',\n'))
        .replace(
            `/*__exports__*/`,
            entries
                .map(entry => `    ${entry} as ${entry}`)
                .join(',\n') + ',')

        .replace(
            `/*__alias_exports__*/`,
            Object.keys(aliases)
                .map(alias => `    ${aliases[alias]} as ${alias}`)
                .join(',\n'))
}
