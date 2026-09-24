const assert = require('assert')
const fs = require('fs')
const os = require('os')
const path = require('path')
const {execFileSync} = require('child_process')
const {pathToFileURL} = require('url')

const buildEs = path.resolve(process.env.ESM_BUILD_DIR || path.join(__dirname, '..', 'build-es'))
const importPattern = /\b(?:from|import|export)\s+['"](\.[^'"]+)['"]/g

function getJavaScriptFiles(directory) {
    return fs.readdirSync(directory, {withFileTypes: true}).flatMap(entry => {
        const entryPath = path.join(directory, entry.name)
        if (entry.isDirectory()) return getJavaScriptFiles(entryPath)
        return entry.name.endsWith('.js') ? [entryPath] : []
    })
}

function checkImports() {
    const extensionless = []
    for (const file of getJavaScriptFiles(buildEs)) {
        const source = fs.readFileSync(file, 'utf8')
        for (const match of source.matchAll(importPattern)) {
            const [, specifier] = match
            if (!specifier.endsWith('.js')) {
                extensionless.push(`${path.relative(buildEs, file)}: ${specifier}`)
            }
        }
    }
    assert.deepStrictEqual(extensionless, [])
}

function checkNativeImportAndUse() {
    const testDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'async-esm-'))
    try {
        fs.cpSync(buildEs, testDirectory, {recursive: true})
        fs.writeFileSync(path.join(testDirectory, 'package.json'), '{"type":"module"}')

        const indexUrl = pathToFileURL(path.join(testDirectory, 'index.js')).href
        const forEachUrl = pathToFileURL(path.join(testDirectory, 'forEach.js')).href
        const testFile = path.join(testDirectory, 'test.mjs')
        fs.writeFileSync(testFile, `
            import async, {each} from ${JSON.stringify(indexUrl)}
            import forEach from ${JSON.stringify(forEachUrl)}
            const run = iteratee => new Promise((resolve, reject) => {
                iteratee([1, 2], (value, callback) => {
                    resolve(value * 2)
                    callback()
                })
            })
            const values = await run(each)
            const aliasValue = await run(forEach)
            if (values !== 2 || aliasValue !== 2) throw new Error('unexpected result')
            if (typeof async.each !== 'function') throw new Error('async.each is unavailable')
        `)

        execFileSync(process.execPath, [testFile], {
            cwd: path.join(__dirname, '..'),
            stdio: 'inherit',
            timeout: 10000
        })
    } finally {
        fs.rmSync(testDirectory, {recursive: true, force: true})
    }
}

checkImports()
checkNativeImportAndUse()
console.log('ESM browser regression passed')
