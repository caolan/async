$(function initSearchBar() {
    var methodNames = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.whitespace,
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        prefetch: './methodNames.json'
    });

    var sourceFiles = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.whitespace,
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        prefetch: './sourceFiles.json'
    });

    var githubIssues = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.whitespace,
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        remote: {
            url: 'https://api.github.com/search/issues?q=%QUERY+repo:caolan/async',
            cache: false,
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
    },
    {
        name: 'Methods',
        source: methodNames,
        templates: {
            header: '<h3 class="search-bar-header-first">Methods</h3>'
        }
    },
    {
        name: 'Files',
        source: sourceFiles,
        templates: {
            header: '<h3 class="search-bar-header">Source Files</h3>'
        }
    },
    {
        name: 'Issues',
        source: githubIssues,
        display: 'name',
        templates: {
            header: '<h3 class="search-bar-header">Issues</h3>'
        }
    }).on('typeahead:select', function(ev, suggestion) {
        var protocol = window.location.protocol
        var host = window.location.host;
        var currentPath = window.location.pathname;
        // handle issues
        if (typeof suggestion !== 'string') {
            window.location.href = suggestion.url;
        // handle source files
        } else if (suggestion.indexOf('.html') !== -1) {
            window.location.href = protocol + '//' + host + '/' + suggestion;
        // handle searching from one of the source files or the home page
        } else if (currentPath !== '/docs.html') {
            window.location.href = protocol + '//' + host + '/docs.html#.' + suggestion;
        } else {
            var $el = document.getElementById('.' + suggestion);
            $('#main').animate({ scrollTop: $el.offsetTop }, 500);
        }
    });
});
