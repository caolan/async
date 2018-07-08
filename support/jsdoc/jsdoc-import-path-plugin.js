const path = require('path');

exports.handlers = {
    jsdocCommentFound(e) {
        var moduleName = path.parse(e.filename).name;


        var lines = e.comment.split(/\r?\n/);

        var importLines = [
            '```',
            `import ${moduleName} from 'async/${moduleName}';`,
            '```'
        ];

        if (moduleName !== 'index') {
            e.comment = [lines[0], ...importLines, ...lines.slice(1)].join("\n");
        }

    }
};
