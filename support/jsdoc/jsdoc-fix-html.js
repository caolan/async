var async = require('../../dist/async.js');
var fs = require('fs-extra');
var path = require('path');

var $ = require('cheerio');

var VERSION = require('../../package.json').version;
var docsDir = path.join(__dirname, '../../docs/v3');
var pageTitle = 'Methods:';

var docFilename = 'docs.html';
var mainModuleFile = 'module-async.html';
var mainScrollableSection = '#main-container';
var sectionTitleClass = '.page-title';

var HTMLFileBegin = '<!DOCTYPE html>\n<html lang="en">\n<head>\n';
var HTMLFileHeadBodyJoin = '</head>\n<body>';
var HTMLFileEnd = '</body>';

function generateHTMLFile(filename, $page, callback) {
    var methodName = filename.match(/\/(\w+)\.js\.html$/);
    if (methodName) {
        var $thisMethodDocLink = $page.find('#toc').find('a[href="'+docFilename+'#'+methodName[1]+'"]');
        $thisMethodDocLink.parent().addClass('active');
    }

    // generate an HTML file from a cheerio object
    var HTMLdata = HTMLFileBegin + $page.find('head').html()
        + HTMLFileHeadBodyJoin + $page.find('body').html()
        + HTMLFileEnd;

    fs.writeFile(filename, HTMLdata, callback);
}

function extractModuleFiles(files) {
    return files.filter((file) => {
        return file.startsWith('module') && file !== mainModuleFile;
    });
}

function combineFakeModules(files, callback) {
    var moduleFiles = extractModuleFiles(files);

    fs.readFile(path.join(docsDir, mainModuleFile), 'utf8', (fileErr, mainModuleData) => {
        if (fileErr) return callback(fileErr);

        var $mainPage = $(mainModuleData);
        // each 'module' (category) has a separate page, with all of the
        // important information in a 'main' div. Combine all of these divs into
        // one on the actual module page (async)
        async.eachSeries(moduleFiles, (file, fileCallback) => {
            fs.readFile(path.join(docsDir, file), 'utf8', (err, moduleData) => {
                if (err) return fileCallback(err);
                var $modulePage = $(moduleData);
                var moduleName = $modulePage.find(sectionTitleClass).text();
                $modulePage.find(sectionTitleClass).attr('id', moduleName.toLowerCase());
                $mainPage.find(mainScrollableSection).append($modulePage.find(mainScrollableSection).html());
                return fileCallback();
            });
        }, (err) => {
            if (err) return callback(err);
            generateHTMLFile(path.join(docsDir, docFilename), $mainPage, callback);
        });
    });
}

function applyPreCheerioFixes(data) {


    var rIncorrectCFText = />ControlFlow</g;
    var fixedCFText = '>Control Flow<';

    var rIncorrectModuleText = />module:(\w+)\.(\w+)</g;

    // the heading needs additional padding at the top so it doesn't get cutoff
    return data
        // for JSDoc to work, the module needs to be labelled 'ControlFlow', while
        // on the page it should appear as 'Control Flow'
        .replace(rIncorrectCFText, fixedCFText)
        // for return types, JSDoc doesn't allow replacing the link text, so it
        // needs to be done here
        .replace(rIncorrectModuleText, (match, moduleName, methodName) => {
            return '>'+methodName+'<';
        });
}


function scrollSpyFix($page, $nav) {
    // move everything into one big ul (for Bootstrap scroll-spy)
    var $ul = $nav.children('ul');
    $ul.addClass('nav').addClass('methods');
    $ul.find('.methods').each(function() {
        var $methodsList = $(this);
        var $methods = $methodsList.find('[data-type="method"]');
        var $parentLi = $methodsList.parent();

        $methodsList.remove();
        $methods.remove();
        $parentLi.after($methods);
        $parentLi.addClass('toc-header');

    });

    $page.find('[data-type="method"]').addClass("toc-method");

    $page.find('[id^="."]').each(function() {
        var $ele = $(this);
        var id = $(this).attr('id');
        $ele.attr('id', id.replace('.', ''));
    });
}

function fixToc(file, $page, moduleFiles) {
    // remove `async` listing from toc
    $page.find('a[href="'+mainModuleFile+'"]').parent().remove();

    // change toc title
    var $nav = $page.find('nav');
    $nav.attr('id', 'toc');
    $nav.children('h3').text(pageTitle);
    $nav.children('h2').remove();

    scrollSpyFix($page, $nav);
    var isDocsFile = file === docFilename
    var prependFilename = isDocsFile ? '' : docFilename;
    // make everything point to the same 'docs.html' page
    moduleFiles.forEach((filename) => {
        $page.find('[href^="'+filename+'"]').each(function() {
            var $ele = $(this);
            var href = $ele.attr('href');

            // category titles should sections title, while everything else
            // points to the correct listing
            if (href === filename) {
                var moduleName = $ele.text().toLowerCase().replace(/\s/g, '').replace('.', '');
                $ele.attr('href', prependFilename+'#'+moduleName);
            } else {
                $ele.attr('href', href.replace(filename, prependFilename).replace('#.', '#'));
            }
        });
    });
}

function fixFooter($page) {
    var $footer = $page.find('footer');
    $page.find(mainScrollableSection).append($footer);
}

function fixModuleLinks(files, callback) {
    var moduleFiles = extractModuleFiles(files);


    async.each(files, (file, fileCallback) => {
        var filePath = path.join(docsDir, file);
        fs.readFile(filePath, 'utf8', (err, fileData) => {
            if (err) return fileCallback(err);
            var $file = $(applyPreCheerioFixes(fileData));

            var $vDropdown = $file.find('#version-dropdown');
            $vDropdown.find('.dropdown-toggle').contents().get(0).data = 'v'+VERSION+' ';
            $vDropdown.find('a[href="'+docFilename+'"]').text('v'+VERSION);

            fixToc(file, $file, moduleFiles);
            fixFooter($file);
            $file.find('[href="'+mainModuleFile+'"]').attr('href', docFilename);
            generateHTMLFile(filePath, $file, fileCallback);
        });
    }, callback);
}

fs.copySync(path.join(__dirname, '../../dist/async.js'), path.join(docsDir, 'scripts/async.js'), { clobber: true });
fs.copySync(path.join(__dirname, './jsdoc-custom.js'), path.join(docsDir, 'scripts/jsdoc-custom.js'), { clobber: true });
fs.copySync(path.join(__dirname, '..', '..', 'logo', 'favicon.ico'), path.join(docsDir, 'favicon.ico'), { clobber: true });
fs.copySync(path.join(__dirname, '..', '..', 'logo', 'async-logo.svg'), path.join(docsDir, 'img', 'async-logo.svg'), { clobber: true });

fs.readdir(docsDir, (readErr, files) => {
    if (readErr) { throw readErr; }

    var HTMLFiles = files
        .filter(file => path.extname(file) === '.html')
        .filter(file => file !== 'docs.html')


    async.waterfall([
        async.constant(HTMLFiles),
        combineFakeModules,
        async.asyncify(() => {
            HTMLFiles.push(docFilename)
        }),
        function(callback) {
            fixModuleLinks(HTMLFiles, callback);
        }
    ], (err) => {
        if (err) throw err;
        console.log('Docs generated successfully');
    });
});
