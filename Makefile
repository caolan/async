# This makefile is meant to be run on OSX/Linux.  Make sure any artifacts
# created here are checked in so people on all platforms can run npm scripts.
# This build should be run once per release.

export PATH := ./node_modules/.bin/:$(PATH):./bin/

PACKAGE = asyncjs
REQUIRE_NAME = async
BABEL_NODE = babel-node
UGLIFY = uglifyjs
XYZ = support/xyz.sh --repo git@github.com:caolan/async.git

BUILDDIR = build
BUILD_ES = build-es
DIST = dist
SRC = lib/index.js
SCRIPTS = ./support
JS_SRC = $(shell find lib/ -type f -name '*.js')
LINT_FILES = lib/ test/ mocha_test/ $(shell find perf/ -maxdepth 2 -type f) support/ gulpfile.js karma.conf.js

UMD_BUNDLE = $(BUILDDIR)/dist/async.js
UMD_BUNDLE_MIN = $(BUILDDIR)/dist/async.min.js
CJS_BUNDLE = $(BUILDDIR)/index.js
ES_MODULES = $(patsubst lib/%.js, build-es/%.js,  $(JS_SRC))


all: clean lint build test

test:
	npm test

clean:
	rm -rf $(BUILDDIR)
	rm -rf $(BUILD_ES)
	rm -rf $(DIST)
	rm -rf tmp/

lint:
	jshint $(LINT_FILES)
	jscs $(LINT_FILES)

# Compile the ES6 modules to singular bundles, and individual bundles
build-bundle: build-modules $(UMD_BUNDLE) $(CJS_BUNDLE)

build-modules:
	$(BABEL_NODE) $(SCRIPTS)/build/modules-cjs.js

$(UMD_BUNDLE): $(JS_SRC) package.json
	mkdir -p "$(@D)"
	$(BABEL_NODE) $(SCRIPTS)/build/aggregate-bundle.js

$(CJS_BUNDLE): $(JS_SRC) package.json
	$(BABEL_NODE) $(SCRIPTS)/build/aggregate-cjs.js

# Create the minified UMD versions and copy them to dist/ for bower
build-dist: $(DIST) $(UMD_BUNDLE) $(UMD_BUNDLE_MIN) $(DIST)/async.js $(DIST)/async.min.js

$(DIST):
	mkdir -p $@

$(UMD_BUNDLE_MIN): $(UMD_BUNDLE)
	mkdir -p "$(@D)"
	$(UGLIFY) $< --mangle --compress \
		--source-map $(DIST)/async.min.map \
		-o $@

$(DIST)/async.js: $(UMD_BUNDLE)
	cp $< $@

$(DIST)/async.min.js: $(UMD_BUNDLE_MIN)
	cp $< $@

build-es: $(ES_MODULES)

$(BUILD_ES)/%.js: lib/%.js
	mkdir -p "$(@D)"
	sed -r "s/(import.+)lodash/\1lodash-es/g" $< > $@

test-build:
	mocha support/build.test.js

build-config: $(BUILDDIR)/package.json $(BUILDDIR)/component.json $(BUILDDIR)/bower.json $(BUILDDIR)/README.md $(BUILDDIR)/LICENSE $(BUILDDIR)/CHANGELOG.md

build-es-config: $(BUILD_ES)/package.json $(BUILD_ES)/README.md $(BUILD_ES)/LICENSE $(BUILD_ES)/CHANGELOG.md

bower.json: package.json
	support/sync-package-managers.js

component.json: package.json
	support/sync-package-managers.js

$(BUILDDIR)/package.json: package.json
	mkdir -p "$(@D)"
	support/sync-cjs-package.js > $@

$(BUILDDIR)/%: %
	mkdir -p "$(@D)"
	cp $< $@

$(BUILD_ES)/package.json: package.json
	mkdir -p "$(@D)"
	support/sync-es-package.js > $@

$(BUILD_ES)/%: %
	mkdir -p "$(@D)"
	cp $< $@

.PHONY: build-modules build-bundle build-dist build-es build-config build-es-config test-build

build: clean build-bundle build-dist build-es build-config build-es-config test-build

.PHONY: test lint build all clean

.PHONY: release-major release-minor release-patch
release-major release-minor release-patch: all
	git add --force $(DIST)
	git commit -am "update minified build"; true
	$(XYZ) --increment $(@:release-%=%)
	# build again to propagate the version
	$(MAKE) build-config
	$(MAKE) build-es-config
	cd build/ && npm pack
	cd build-es/ && npm pack
