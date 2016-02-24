import _ from 'lodash';
import {dirname, sep} from 'path';

export default function() {
    return {
        visitor: {

            ImportDeclaration(path, mapping) {
                let {node} = path;
                let {value} = node.source;

                if (/\blodash\b/.test(value)) {
                    let f = mapping.file.opts.filename;
                    let dir = dirname(f).split(sep);
                    let relative = _.repeat('../', dir.length + 1);

                    node.source.value = value.replace(
                        /\blodash\b/,
                        relative + 'node_modules/lodash-es');
                }
            }
        }
    };
}
