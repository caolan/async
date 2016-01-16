export PATH := ./node_modules/.bin/:$(PATH):./bin/

PACKAGE = asyncjs
REQUIRE_NAME = async
BABEL_NODE = babel-node
UGLIFY = uglifyjs
XYZ = xyz --repo git@github.com:caolan/async.git

BUILDDIR = build
DIST = dist
SRC = lib/index.js
SCRIPTS = ./support
JS_SRC = $(shell find lib/ -type f -name '*.js') package.json
LINT_FILES = lib/ test/ mocha_test/ $(shell find perf/ -maxdepth 2 -type f) support/ gulpfile.js karma.conf.js

UMD_BUNDLE = $(BUILDDIR)/async.js
CJS_BUNDLE = $(BUILDDIR)/index.js

all: lint test clean build

test:
	npm test

test-build: build
	mocha support/build.test.js

clean:
	rm -rf $(BUILDDIR)
	rm -rf $(DIST)

lint:
	jshint $(LINT_FILES)
	jscs $(LINT_FILES)


build-bundle: build-modules $(UMD_BUNDLE) $(CJS_BUNDLE)

build-modules:
	$(BABEL_NODE) $(SCRIPTS)/build/modules-cjs.js

$(UMD_BUNDLE): $(JS_SRC)
	$(BABEL_NODE) $(SCRIPTS)/build/aggregate-bundle.js

$(CJS_BUNDLE): $(JS_SRC)
	$(BABEL_NODE) $(SCRIPTS)/build/aggregate-cjs.js

.PHONY: build-modules build-bundle

build-dist:
	mkdir -p $(DIST)
	cp $(BUILDDIR)/async.js $(DIST)/async.js
	$(UGLIFY) $(DIST)/async.js -mc \
		--source-map $(DIST)/async.min.map \
		-o $(DIST)/async.min.js

build: clean build-bundle build-dist

.PHONY: test lint build all clean

.PHONY: release-major release-minor release-patch
release-major release-minor release-patch: all
	$(SCRIPTS)/sync-package-managers.js
	git add --force *.json
	git add --force $(BUILDDIR)
	git commit -am "update minified build"; true
	$(XYZ) --increment $(@:release-%=%)
