export PATH := ./node_modules/.bin/:$(PATH):./bin/

PACKAGE = asyncjs
REQUIRE_NAME = async
XYZ = node_modules/.bin/xyz --repo git@github.com:caolan/async.git
BROWSERIFY = node_modules/.bin/browserify

BUILDDIR = dist
SRC = lib/index.js

all: lint test clean build

build: $(wildcard  lib/*.js)
	mkdir -p $(BUILDDIR)
	browserify $(SRC) -o $(BUILDDIR)/async.js -s $(REQUIRE_NAME)
	uglifyjs $(BUILDDIR)/async.js -mc \
		--source-map $(BUILDDIR)/async.min.map \
		-o $(BUILDDIR)/async.min.js

test:
	nodeunit test

clean:
	rm -rf $(BUILDDIR)

lint:
	jshint $(SRC) test/*.js mocha_test/* perf/*.js
	jscs $(SRC) test/*.js mocha_test/* perf/*.js

.PHONY: test lint build all clean


.PHONY: release-major release-minor release-patch
release-major release-minor release-patch: all
	./support/sync-package-managers.js
	git add --force *.json
	git add --force $(BUILDDIR)
	git commit -am "update minified build"; true
	$(XYZ) --increment $(@:release-%=%)
