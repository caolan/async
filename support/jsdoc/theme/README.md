# Minami

A clean, responsive documentation template theme for JSDoc 3.

![Minami Screenshot](http://puu.sh/gOyNe/66c3adcb97.png)

## Uses

- [the Taffy Database library](http://taffydb.com/)
- [Underscore Template library](http://documentcloud.github.com/underscore/#template)
- [Montserrat](http://www.google.com/fonts/specimen/Monsterrat) & Helvetica Neue

## Install

```bash
$ npm install --save-dev minami
```

## Usage

Clone repository to your designated `jsdoc` template directory, then:

```bash
$ jsdoc entry-file.js -t path/to/minami
```

### Node.js Dependency

In your projects `package.json` file add a generate script:

```json
"script": {
  "generate-docs": "node_modules/.bin/jsdoc --configure .jsdoc.json --verbose"
}
```

In your `.jsdoc.json` file, add a template option.

```json
"opts": {
  "template": "node_modules/minami"
}
```

### Example JSDoc Config

```json
{
    "tags": {
        "allowUnknownTags": true,
        "dictionaries": ["jsdoc"]
    },
    "source": {
        "include": ["lib", "package.json", "README.md"],
        "includePattern": ".js$",
        "excludePattern": "(node_modules/|docs)"
    },
    "plugins": [
        "plugins/markdown"
    ],
    "templates": {
        "cleverLinks": false,
        "monospaceLinks": true
    },
    "opts": {
        "destination": "./docs/",
        "encoding": "utf8",
        "private": true,
        "recurse": true,
        "template": "./node_modules/minami"
    }
}
```

## License

Licensed under the Apache2 license.