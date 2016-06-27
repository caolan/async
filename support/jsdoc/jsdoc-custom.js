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

    $('.typeahead').typeahead({
        hint: true,
        highlight: true,
        minLength: 1
    },
    {
        name: 'Methods',
        source: methodNames,
        templates: {
            header: '<h3 class="search-bar-header">Methods</h3>'
        }
    },
    {
        name: 'Files',
        source: sourceFiles,
        templates: {
            header: '<h3 class="search-bar-header">Source Files</h3>'
        }
    }).on('typeahead:select', function(ev, suggestion) {
        var $el = document.getElementById('.' + suggestion)
        $('html, body').animate({ scrollTop: $el.offsetTop }, 500);
    });
});
