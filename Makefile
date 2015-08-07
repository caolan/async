PACKAGE = asyncjs
CWD := $(shell pwd)
NODEUNIT = "$(CWD)/node_modules/.bin/nodeunit"
UGLIFY = "$(CWD)/node_modules/.bin/uglifyjs"
JSHINT = "$(CWD)/node_modules/.bin/jshint"
JSCS = "$(CWD)/node_modules/.bin/jscs"
XYZ = node_modules/.bin/xyz --repo git@github.com:caolan/async.git

BUILDDIR = dist
SRC = lib/async.js

all: lint test clean build

build: $(wildcard  lib/*.js)
	mkdir -p $(BUILDDIR)
	cp $(SRC) $(BUILDDIR)/async.js
	cd $(BUILDDIR) && $(UGLIFY) async.js -mc --source-map async.min.map -o async.min.js

test:
	$(NODEUNIT) test

clean:
	rm -rf $(BUILDDIR)

lint:
	$(JSHINT) $(SRC) test/*.js mocha_test/* perf/*.js
	$(JSCS) $(SRC) test/*.js mocha_test/* perf/*.js

.PHONY: test lint build all clean


.PHONY: release-major release-minor release-patch
release-major release-minor release-patch: all
	./support/sync-package-managers.js
	git add --force *.json
	git add --force $(BUILDDIR)
	git commit -am "update minified build"; true
	$(XYZ) --increment $(@:release-%=%)
