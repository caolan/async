export PATH := ./node_modules/.bin/:$(PATH):./bin/

PACKAGE = asyncjs
REQUIRE_NAME = async
NODE = node_modules/babel-cli/bin/babel-node.js
UGLIFY = node_modules/.bin/uglifyjs
XYZ = node_modules/.bin/xyz --repo git@github.com:caolan/async.git

BUILDDIR = build
DIST = dist
SRC = lib/index.js
SCRIPTS = ./support

all: lint test clean build

test:
	npm test

clean:
	rm -rf $(BUILDDIR)
	rm -rf $(DIST)

lint:
	jshint $(SRC) test/*.js mocha_test/* perf/*.js
	jscs $(SRC) test/*.js mocha_test/* perf/*.js


build-bundle:
	$(NODE) $(SCRIPTS)/build/modules-cjs.js
	$(NODE) $(SCRIPTS)/build/aggregate-bundle.js
	$(NODE) $(SCRIPTS)/build/aggregate-cjs.js

build-dist:
	mkdir -p $(DIST)
	cp $(BUILDDIR)/async-bundle.js $(DIST)/
	$(UGLIFY) $(DIST)/async-bundle.js -mc \
		--source-map $(DIST)/async-bundle.min.map \
		-o $(DIST)/async-bundle.min.js

build: clean build-bundle build-dist

.PHONY: test lint build all clean

.PHONY: release-major release-minor release-patch
release-major release-minor release-patch: all
	$(SCRIPTS)/sync-package-managers.js
	git add --force *.json
	git add --force $(BUILDDIR)
	git commit -am "update minified build"; true
	$(XYZ) --increment $(@:release-%=%)
