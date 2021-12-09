/*global env: true */
'use strict';

const doop = require('jsdoc/util/doop');
const fs = require('jsdoc/fs'); // jsdoc/fs offer non-standard functions (mkPath)
const fsExtra = require('fs-extra');
const helper = require('jsdoc/util/templateHelper');
const logger = require('jsdoc/util/logger');
const path = require('jsdoc/path');
const taffy = require('taffydb').taffy;
const template = require('jsdoc/template');
const util = require('util');

const htmlsafe = helper.htmlsafe;
const linkto = helper.linkto;
const resolveAuthorLinks = helper.resolveAuthorLinks;
const hasOwnProp = Object.prototype.hasOwnProperty;

let data;
let view;

let outdir = path.normalize(env.opts.destination);

function find(spec) {
    return helper.find(data, spec);
}

function tutoriallink(tutorial) {
    return helper.toTutorial(tutorial, null, { tag: 'em', classname: 'disabled', prefix: 'Tutorial: ' });
}

function getAncestorLinks(doclet) {
    return helper.getAncestorLinks(data, doclet);
}

function hashToLink(doclet, hash) {
    if ( !/^(#.+)/.test(hash) ) { return hash; }

    let url = helper.createLink(doclet);

    url = url.replace(/(#.+|$)/, hash);
    return '<a href="' + url + '">' + hash + '</a>';
}

function needsSignature(doclet) {
    let needsSig = false;

    // function and class definitions always get a signature
    if (doclet.kind === 'function' || doclet.kind === 'class') {
        needsSig = true;
    }
    // typedefs that contain functions get a signature, too
    else if (doclet.kind === 'typedef' && doclet.type && doclet.type.names &&
        doclet.type.names.length) {
        for (let i = 0, l = doclet.type.names.length; i < l; i++) {
            if (doclet.type.names[i].toLowerCase() === 'function') {
                needsSig = true;
                break;
            }
        }
    }

    return needsSig;
}

function getSignatureAttributes(item) {
    const attributes = [];

    if (item.optional) {
        attributes.push('opt');
    }

    if (item.nullable === true) {
        attributes.push('nullable');
    }
    else if (item.nullable === false) {
        attributes.push('non-null');
    }

    return attributes;
}

function updateItemName(item) {
    const attributes = getSignatureAttributes(item);
    let itemName = item.name || '';

    if (item.variable) {
        itemName = '&hellip;' + itemName;
    }

    if (attributes && attributes.length) {
        itemName = util.format( '%s<span class="signature-attributes">%s</span>', itemName,
            attributes.join(', ') );
    }

    return itemName;
}

function addParamAttributes(params) {
    return params.filter(param => {
        return param.name && param.name.indexOf('.') === -1;
    }).map(updateItemName);
}

function buildItemTypeStrings(item) {
    const types = [];

    if (item && item.type && item.type.names) {
        item.type.names.forEach(name => {
            types.push( linkto(name, htmlsafe(name)) );
        });
    }

    return types;
}

function buildAttribsString(attribs) {
    let attribsString = '';

    if (attribs && attribs.length) {
        attribsString = htmlsafe( util.format('(%s) ', attribs.join(', ')) );
    }

    return attribsString;
}

function addNonParamAttributes(items) {
    let types = [];

    items.forEach(item => {
        types = types.concat( buildItemTypeStrings(item) );
    });

    return types;
}

function addSignatureParams(f) {
    const params = f.params ? addParamAttributes(f.params) : [];
    f.signature = util.format( '%s(%s)', (f.signature || ''), params.join(', ') );
}

function addSignatureReturns(f) {
    const attribs = [];
    let attribsString = '';
    let returnTypes = [];
    let returnTypesString = '';

    // jam all the return-type attributes into an array. this could create odd results (for example,
    // if there are both nullable and non-nullable return types), but let's assume that most people
    // who use multiple @return tags aren't using Closure Compiler type annotations, and vice-versa.
    if (f.returns) {
        f.returns.forEach(item => {
            helper.getAttribs(item).forEach(attrib => {
                if (attribs.indexOf(attrib) === -1) {
                    attribs.push(attrib);
                }
            });
        });

        attribsString = buildAttribsString(attribs);
    }

    if (f.returns) {
        returnTypes = addNonParamAttributes(f.returns);
    }
    if (returnTypes.length) {
        returnTypesString = util.format( ' &rarr; %s{%s}', attribsString, returnTypes.join('|') );
    }

    f.signature = '<span class="signature">' + (f.signature || '') + '</span>' +
        '<span class="type-signature">' + returnTypesString + '</span>';
}

function addSignatureTypes(f) {
    const types = f.type ? buildItemTypeStrings(f) : [];

    f.signature = (f.signature || '') + '<span class="type-signature">' +
        (types.length ? ' :' + types.join('|') : '') + '</span>';
}

function addAttribs(f) {
    const attribs = helper.getAttribs(f);
    const attribsString = buildAttribsString(attribs);

    f.attribs = util.format('<span class="type-signature">%s</span>', attribsString);
}

function shortenPaths(files, commonPrefix) {
    Object.keys(files).forEach(file => {
        files[file].shortened = files[file].resolved.replace(commonPrefix, '')
            // always use forward slashes
            .replace(/\\/g, '/');
    });

    return files;
}

function getPathFromDoclet(doclet) {
    if (!doclet.meta) {
        return null;
    }

    return doclet.meta.path && doclet.meta.path !== 'null' ?
        path.join(doclet.meta.path, doclet.meta.filename) :
        doclet.meta.filename;
}

function generate(type, title, docs, filename, resolveLinks) {
    resolveLinks = resolveLinks === false ? false : true;

    const docData = {
        type: type,
        title: title,
        docs: docs
    };

    const outpath = path.join(outdir, filename);
    let html = view.render('container.tmpl', docData);

    if (resolveLinks) {
        html = helper.resolveLinks(html); // turn {@link foo} into <a href="foodoc.html">foo</a>
    }

    fs.writeFileSync(outpath, html, 'utf8');
}

function generateSourceFiles(sourceFiles, encoding) {
    encoding = encoding || 'utf8';
    const sourceFilenames = [];
    Object.keys(sourceFiles).forEach(file => {
        let source;
        // links are keyed to the shortened path in each doclet's `meta.shortpath` property
        const sourceOutfile = helper.getUniqueFilename(sourceFiles[file].shortened);
        sourceFilenames.push(sourceOutfile);
        helper.registerLink(sourceFiles[file].shortened, sourceOutfile);

        try {
            source = {
                kind: 'source',
                code: helper.htmlsafe( fs.readFileSync(sourceFiles[file].resolved, encoding) )
            };
        }
        catch(e) {
            logger.error('Error while generating source file %s: %s', file, e.message);
        }
        generate('Source', sourceFiles[file].shortened, [source], sourceOutfile, false);
    });
    return sourceFilenames;
}

/**
 * Look for classes or functions with the same name as modules (which indicates that the module
 * exports only that class or function), then attach the classes or functions to the `module`
 * property of the appropriate module doclets. The name of each class or function is also updated
 * for display purposes. This function mutates the original arrays.
 *
 * @private
 * @param {Array.<module:jsdoc/doclet.Doclet>} doclets - The array of classes and functions to
 * check.
 * @param {Array.<module:jsdoc/doclet.Doclet>} modules - The array of module doclets to search.
 */
function attachModuleSymbols(doclets, modules) {
    const symbols = {};

    // build a lookup table
    doclets.forEach(symbol => {
        symbols[symbol.longname] = symbols[symbol.longname] || [];
        symbols[symbol.longname].push(symbol);
    });

    return modules.map(module => {
        if (symbols[module.longname]) {
            module.modules = symbols[module.longname]
                // Only show symbols that have a description. Make an exception for classes, because
                // we want to show the constructor-signature heading no matter what.
                .filter(symbol => {
                    return symbol.description || symbol.kind === 'class';
                })
                .map(symbol => {
                    symbol = doop(symbol);

                    if (symbol.kind === 'class' || symbol.kind === 'function') {
                        symbol.name = symbol.name.replace('module:', '(require("') + '"))';
                    }

                    return symbol;
                });
        }
    });
}

function buildMemberNav(items, itemHeading, itemsSeen, linktoFn) {
    let nav = '';

    if (items && items.length) {
        let itemsNav = '';

        items.forEach(item => {
            const methods = find({kind:'function', memberof: item.longname});
            const members = find({kind:'member', memberof: item.longname});

            if ( !hasOwnProp.call(item, 'longname') ) {
                itemsNav += '<li>' + linktoFn('', item.name);
                itemsNav += '</li>';
            } else if ( !hasOwnProp.call(itemsSeen, item.longname) ) {
                itemsNav += '<li>' + linktoFn(item.longname, item.name.replace(/^module:/, ''));
                if (methods.length) {
                    itemsNav += "<ul class='methods'>";

                    methods.forEach(method => {
                        itemsNav += "<li data-type='method'>";
                        itemsNav += linkto(method.longname, method.name);
                        itemsNav += "</li>";
                    });

                    itemsNav += "</ul>";
                }
                itemsNav += '</li>';
                itemsSeen[item.longname] = true;
            }
        });

        if (itemsNav !== '') {
            nav += '<h3>' + itemHeading + '</h3><ul>' + itemsNav + '</ul>';
        }
    }

    return nav;
}

function linktoTutorial(longName, name) {
    return tutoriallink(name);
}

function linktoExternal(longName, name) {
    return linkto(longName, name.replace(/(^"|"$)/g, ''));
}

/**
 * Create the navigation sidebar.
 * @param {object} members The members that will be used to create the sidebar.
 * @param {array<object>} members.classes
 * @param {array<object>} members.externals
 * @param {array<object>} members.globals
 * @param {array<object>} members.mixins
 * @param {array<object>} members.modules
 * @param {array<object>} members.namespaces
 * @param {array<object>} members.tutorials
 * @param {array<object>} members.events
 * @param {array<object>} members.interfaces
 * @return {string} The HTML for the navigation sidebar.
 */
function buildNav(members) {
    let nav = '<h2><a href="index.html">Home</a></h2>';
    const seen = {};
    const seenTutorials = {};

    nav += buildMemberNav(members.classes, 'Classes', seen, linkto);
    nav += buildMemberNav(members.modules, 'Modules', {}, linkto);
    nav += buildMemberNav(members.externals, 'Externals', seen, linktoExternal);
    nav += buildMemberNav(members.events, 'Events', seen, linkto);
    nav += buildMemberNav(members.namespaces, 'Namespaces', seen, linkto);
    nav += buildMemberNav(members.mixins, 'Mixins', seen, linkto);
    nav += buildMemberNav(members.tutorials, 'Tutorials', seenTutorials, linktoTutorial);
    nav += buildMemberNav(members.interfaces, 'Interfaces', seen, linkto);

    if (members.globals.length) {
        let globalNav = '';

        members.globals.forEach(g => {
            if ( g.kind !== 'typedef' && !hasOwnProp.call(seen, g.longname) ) {
                globalNav += '<li>' + linkto(g.longname, g.name) + '</li>';
            }
            seen[g.longname] = true;
        });

        if (!globalNav) {
            // turn the heading into a link so you can actually get to the global page
            nav += '<h3>' + linkto('global', 'Global') + '</h3>';
        }
        else {
            nav += '<h3>Global</h3><ul>' + globalNav + '</ul>';
        }
    }

    return nav;
}

/**
    Sorts an array of strings alphabetically
    @param {Array<String>} strArr - Array of strings to sort
    @return {Array<String>} The sorted array
 */
function sortStrs(strArr) {
    return strArr.sort((s1, s2) => {
        const lowerCaseS1 = s1.toLowerCase();
        const lowerCaseS2 = s2.toLowerCase();

        if (lowerCaseS1 < lowerCaseS2) {
            return -1;
        } else if (lowerCaseS1 > lowerCaseS2) {
            return 1;
        } else {
            return 0;
        }
    });
}

/**
    Prints into <outdir>/data a `methodNames.json` and a `sourceFiles.json`
    JSON file that contains methods and files that can be searched on the
    generated doc site.
    @param {Array<String>} methodNames - A list of method names
    @param {Array<String>} sourceFilenames - A list of source filenames
 */
function writeSearchData(methodNames, sourceFilenames) {
    const dataDir = path.join(outdir, 'data');
    fsExtra.mkdirsSync(dataDir);
    fsExtra.writeJsonSync(path.join(dataDir, 'methodNames.json'), sortStrs(methodNames), 'utf8');
    fsExtra.writeJsonSync(path.join(dataDir, 'sourceFiles.json'), sortStrs(sourceFilenames), 'utf8');
}

/**
    @param {TAFFY} taffyData See <http://taffydb.com/>.
    @param {object} opts
    @param {Tutorial} tutorials
 */
exports.publish = (taffyData, opts, tutorials) => {
    data = taffyData;

    const conf = env.conf.templates || {};
    conf.default = conf.default || {};

    const templatePath = path.normalize(opts.template);
    view = new template.Template( path.join(templatePath, 'tmpl') );

    // claim some special filenames in advance, so the All-Powerful Overseer of Filename Uniqueness
    // doesn't try to hand them out later
    const indexUrl = helper.getUniqueFilename('index');
    // don't call registerLink() on this one! 'index' is also a valid longname

    const globalUrl = helper.getUniqueFilename('global');
    helper.registerLink('global', globalUrl);

    // set up templating
    view.layout = conf.default.layoutFile ?
        path.getResourcePath(path.dirname(conf.default.layoutFile),
            path.basename(conf.default.layoutFile) ) :
        'layout.tmpl';

    // set up tutorials for helper
    helper.setTutorials(tutorials);

    data = helper.prune(data);
    data.sort('longname, version, since');
    helper.addEventListeners(data);

    let sourceFiles = {};
    const sourceFilePaths = [];
    data().each(doclet => {
         doclet.attribs = '';

        if (doclet.examples) {
            doclet.examples = doclet.examples.map(example => {
                let caption, code;

                if (example.match(/^\s*<caption>([\s\S]+?)<\/caption>(\s*[\n\r])([\s\S]+)$/i)) {
                    caption = RegExp.$1;
                    code = RegExp.$3;
                }

                return {
                    caption: caption || '',
                    code: code || example
                };
            });
        }
        if (doclet.see) {
            doclet.see.forEach((seeItem, i) => {
                doclet.see[i] = hashToLink(doclet, seeItem);
            });
        }

        // build a list of source files
        let sourcePath;
        if (doclet.meta) {
            sourcePath = getPathFromDoclet(doclet);
            sourceFiles[sourcePath] = {
                resolved: sourcePath,
                shortened: null
            };
            if (sourceFilePaths.indexOf(sourcePath) === -1) {
                sourceFilePaths.push(sourcePath);
            }
        }
    });

    // update outdir if necessary, then create outdir
    const packageInfo = ( find({kind: 'package'}) || [] ) [0];
    if (packageInfo && packageInfo.name) {
        outdir = path.join( outdir, packageInfo.name, (packageInfo.version || '') );
    }
    fs.mkPath(outdir);

    // copy the template's static files to outdir
    const fromDir = path.join(templatePath, 'static');
    const staticFiles = fs.ls(fromDir, 3);

    staticFiles.forEach(fileName => {
        const toDir = fs.toDir( fileName.replace(fromDir, outdir) );
        fs.mkPath(toDir);
        fs.copyFileSync(fileName, toDir);
    });

    // copy user-specified static files to outdir
    let staticFilePaths;
    let staticFileFilter;
    let staticFileScanner;
    if (conf.default.staticFiles) {
        // The canonical property name is `include`. We accept `paths` for backwards compatibility
        // with a bug in JSDoc 3.2.x.
        staticFilePaths = conf.default.staticFiles.include ||
            conf.default.staticFiles.paths ||
            [];
        staticFileFilter = new (require('jsdoc/src/filter').Filter)(conf.default.staticFiles);
        staticFileScanner = new (require('jsdoc/src/scanner').Scanner)();

        staticFilePaths.forEach(filePath => {
            const extraStaticFiles = staticFileScanner.scan([filePath], 10, staticFileFilter);

            extraStaticFiles.forEach(fileName => {
                const sourcePath = fs.toDir(filePath);
                const toDir = fs.toDir( fileName.replace(sourcePath, outdir) );
                fs.mkPath(toDir);
                fs.copyFileSync(fileName, toDir);
            });
        });
    }

    if (sourceFilePaths.length) {
        sourceFiles = shortenPaths( sourceFiles, path.commonPrefix(sourceFilePaths) );
    }
    data().each(doclet => {
        const url = helper.createLink(doclet);
        helper.registerLink(doclet.longname, url);

        // add a shortened version of the full path
        let docletPath;
        if (doclet.meta) {
            docletPath = getPathFromDoclet(doclet);
            docletPath = sourceFiles[docletPath].shortened;
            if (docletPath) {
                doclet.meta.shortpath = docletPath;
            }
        }
    });

    data().each(doclet => {
        const url = helper.longnameToUrl[doclet.longname];

        if (url.indexOf('#') > -1) {
            doclet.id = helper.longnameToUrl[doclet.longname].split(/#/).pop();
        }
        else {
            doclet.id = doclet.name;
        }

        if ( needsSignature(doclet) ) {
            addSignatureParams(doclet);
            addSignatureReturns(doclet);
            addAttribs(doclet);
        }
    });

    // do this after the urls have all been generated
    const methodNames = [];
    data().each(doclet => {
        doclet.ancestors = getAncestorLinks(doclet);
        if (doclet.kind === 'function') {
            let alias = doclet.alias;
            const name  = doclet.name;
            if (alias) {
                if (Array.isArray(alias)) {
                    alias = alias.join(', ');
                }
                methodNames.push(name + ` (${alias})`);
            } else {
                methodNames.push(name);
            }
        }

        if (doclet.kind === 'member') {
            addSignatureTypes(doclet);
            addAttribs(doclet);
        }

        if (doclet.kind === 'constant') {
            addSignatureTypes(doclet);
            addAttribs(doclet);
            doclet.kind = 'member';
        }
    });

    const members = helper.getMembers(data);
    members.tutorials = tutorials.children;

    // output pretty-printed source files by default
    const outputSourceFiles = conf.default && conf.default.outputSourceFiles !== false
        ? true
        : false;

    // add template helpers
    view.find = find;
    view.linkto = linkto;
    view.resolveAuthorLinks = resolveAuthorLinks;
    view.tutoriallink = tutoriallink;
    view.htmlsafe = htmlsafe;
    view.outputSourceFiles = outputSourceFiles;

    // once for all
    view.nav = buildNav(members);
    attachModuleSymbols( find({ longname: {left: 'module:'} }), members.modules );

    // generate the pretty-printed source files first so other pages can link to them
    let sourceFilenames = [];
    if (outputSourceFiles) {
        sourceFilenames = generateSourceFiles(sourceFiles, opts.encoding);
    }

    writeSearchData(methodNames, sourceFilenames);

    if (members.globals.length) {
        generate('', 'Global', [{kind: 'globalobj'}], globalUrl);
    }

    // index page displays information from package.json and lists files
    const files = find({kind: 'file'});
    const packages = find({kind: 'package'});

    generate('', 'Home',
        packages.concat(
            [{kind: 'mainpage', readme: opts.readme, longname: (opts.mainpagetitle) ? opts.mainpagetitle : 'Main Page'}]
        ).concat(files),
    indexUrl);

    // set up the lists that we'll use to generate pages
    const classes = taffy(members.classes);
    const modules = taffy(members.modules);
    const namespaces = taffy(members.namespaces);
    const mixins = taffy(members.mixins);
    const externals = taffy(members.externals);
    const interfaces = taffy(members.interfaces);

    Object.keys(helper.longnameToUrl).forEach(longname => {
        const myModules = helper.find(modules, {longname: longname});
        if (myModules.length) {
            generate('Module', myModules[0].name, myModules, helper.longnameToUrl[longname]);
        }

        const myClasses = helper.find(classes, {longname: longname});
        if (myClasses.length) {
            generate('Class', myClasses[0].name, myClasses, helper.longnameToUrl[longname]);
        }

        const myNamespaces = helper.find(namespaces, {longname: longname});
        if (myNamespaces.length) {
            generate('Namespace', myNamespaces[0].name, myNamespaces, helper.longnameToUrl[longname]);
        }

        const myMixins = helper.find(mixins, {longname: longname});
        if (myMixins.length) {
            generate('Mixin', myMixins[0].name, myMixins, helper.longnameToUrl[longname]);
        }

        const myExternals = helper.find(externals, {longname: longname});
        if (myExternals.length) {
            generate('External', myExternals[0].name, myExternals, helper.longnameToUrl[longname]);
        }

        const myInterfaces = helper.find(interfaces, {longname: longname});
        if (myInterfaces.length) {
            generate('Interface', myInterfaces[0].name, myInterfaces, helper.longnameToUrl[longname]);
        }
    });

    // TODO: move the tutorial functions to templateHelper.js
    function generateTutorial(title, tutorial, filename) {
        const tutorialData = {
            title: title,
            header: tutorial.title,
            content: tutorial.parse(),
            children: tutorial.children
        };

        const tutorialPath = path.join(outdir, filename);
        let html = view.render('tutorial.tmpl', tutorialData);

        // yes, you can use {@link} in tutorials too!
        html = helper.resolveLinks(html); // turn {@link foo} into <a href="foodoc.html">foo</a>
        fs.writeFileSync(tutorialPath, html, 'utf8');
    }

    // tutorials can have only one parent so there is no risk for loops
    function saveChildren(node) {
        node.children.forEach(child => {
            generateTutorial('Tutorial: ' + child.title, child, helper.tutorialToUrl(child.name));
            saveChildren(child);
        });
    }

    saveChildren(tutorials);
};
