#!/bin/sh
PACKAGE = nodelint
NODEJS = $(if $(shell test -f /usr/bin/nodejs && echo "true"),nodejs,node)

PREFIX ?= /usr/local
BINDIR ?= $(PREFIX)/bin
DATADIR ?= $(PREFIX)/share
MANDIR ?= $(PREFIX)/share/man
LIBDIR ?= $(PREFIX)/lib
ETCDIR = /etc
PACKAGEDATADIR ?= $(DATADIR)/$(PACKAGE)

BUILDDIR = dist

$(shell if [ ! -d $(BUILDDIR) ]; then mkdir $(BUILDDIR); fi)

DOCS = $(shell find doc -name '*.md' \
        |sed 's|.md|.1|g' \
        |sed 's|doc/|man1/|g' \
        )

all: build doc

build: stamp-build

stamp-build: jslint/jslint.js nodelint config.js
	touch $@;
	cp $^ $(BUILDDIR);
	perl -pi -e 's{^\s*SCRIPT_DIRECTORY =.*?\n}{}ms' $(BUILDDIR)/nodelint
	perl -pi -e 's{path\.join\(SCRIPT_DIRECTORY, '\''config.js'\''\)}{"$(ETCDIR)/nodelint.conf"}' $(BUILDDIR)/nodelint
	perl -pi -e 's{path\.join\(SCRIPT_DIRECTORY, '\''jslint/jslint\.js'\''\)}{"$(PACKAGEDATADIR)/jslint.js"}' $(BUILDDIR)/nodelint

install: build doc
	install --directory $(PACKAGEDATADIR)
	install --mode 0644 $(BUILDDIR)/jslint.js $(PACKAGEDATADIR)/jslint.js
	install --mode 0644 $(BUILDDIR)/config.js $(ETCDIR)/nodelint.conf
	install --mode 0755 $(BUILDDIR)/nodelint $(BINDIR)/nodelint
	install --directory $(MANDIR)/man1/
	cp -a man1/nodelint.1 $(MANDIR)/man1/

uninstall:
	rm -rf $(PACKAGEDATADIR)/jslint.js $(ETCDIR)/nodelint.conf $(BINDIR)/nodelint
	rm -rf $(MANDIR)/man1/nodelint.1

clean:
	rm -rf $(BUILDDIR) stamp-build

dependencies: stamp-dependencies

stamp-dependencies:
	touch stamp-dependencies;
	npm install

devdependencies: stamp-devdependencies

stamp-devdependencies:
	touch stamp-devdependencies;
	touch stamp-dependencies;
	npm install --dev

test: devdependencies
	./node_modules/.bin/nodeunit ./test/*.js

lint: devdependencies
	./nodelint ./nodelint ./config.js ./examples/reporters/ ./examples/textmate/ ./examples/vim/ ./test/

lint-package-json: devdependencies
	./nodelint ./package.json

doc: devdependencies man1 $(DOCS)
	@true

man1:
	@if ! test -d man1 ; then mkdir -p man1 ; fi

# use `npm install ronn` for this to work.
man1/%.1: doc/%.md
	./node_modules/.bin/ronn --roff $< > $@

.PHONY: test install uninstall build all
