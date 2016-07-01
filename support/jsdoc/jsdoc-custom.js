/* eslint no-undef: "off" */
$(function initSearchBar() {
    function matchSubstrs(methodName) {
        var tokens = [];
        var len = methodName.length;
        for (var size = 1; size <= len; size++){
            for (var i = 0; i+size<= len; i++){
                tokens.push(methodName.substr(i, size));
            }
        }
        return tokens;
    }

    var methodNames = new Bloodhound({
        datumTokenizer: matchSubstrs,
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        prefetch: {
            url: './data/methodNames.json',
            cache: false
        }
    });

    var sourceFiles = new Bloodhound({
        datumTokenizer: matchSubstrs,
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        prefetch: {
            url: './data/sourceFiles.json',
            cache: false
        }
    });

    var githubIssues = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.whitespace,
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        remote: {
            url: 'https://api.github.com/search/issues?q=%QUERY+repo:caolan/async',
            cache: true,
            wildcard: '%QUERY',
            transform: function(response) {
                return $.map(response.items, function(issue) {
                    // if (issue.state !== 'open') {
                    //     return null;
                    // }
                    return {
                        url: issue.html_url,
                        name: issue.number + ': ' + issue.title,
                        number: issue.number
                    };
                }).sort(function(a, b) {
                    return b.number - a.number;
                });
            }
        }
    });

    $('.typeahead').typeahead({
        hint: true,
        highlight: true,
        minLength: 1
    }, {
        name: 'Methods',
        source: methodNames,
        templates: {
            header: '<h3 class="search-bar-header-first">Methods</h3>'
        }
    }, {
        name: 'Files',
        source: sourceFiles,
        templates: {
            header: '<h3 class="search-bar-header">Source Files</h3>'
        }
    }, {
        name: 'Issues',
        source: githubIssues,
        display: 'name',
        templates: {
            header: '<h3 class="search-bar-header">Issues</h3>'
        }
    }).on('typeahead:select', function(ev, suggestion) {
        var host;
        if (location.origin != "null") {
            host = location.origin;
        } else {
            host = location.protocol + '//' + location.host;
        }

        var _path = location.pathname.split("/");
        var currentPage = _path[_path.length - 1];
        host += "/" + _path.slice(1, -1).join("/") + "/";

        // handle issues
        if (typeof suggestion !== 'string') {
            location.href = suggestion.url;
        // handle source files
        } else if (suggestion.indexOf('.html') !== -1) {
            location.href = host + suggestion;
        // handle searching from one of the source files or the home page
        } else if (currentPage !== 'docs.html') {
            location.href = host + 'docs.html#.' + suggestion;
        } else {
            var $el = document.getElementById('.' + suggestion);
            $('#main').animate({ scrollTop: $el.offsetTop - 60 }, 500);
        }
    });
});
