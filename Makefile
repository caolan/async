PACKAGE = asyncjs
CWD := $(shell pwd)
NODEUNIT = "$(CWD)/node_modules/.bin/nodeunit"
UGLIFY = "$(CWD)/node_modules/.bin/uglifyjs"
JSHINT = "$(CWD)/node_modules/.bin/jshint"
XYZ = node_modules/.bin/xyz --repo git@github.com:caolan/async.git

BUILDDIR = lib

all: clean test build

build: $(wildcard  lib/*.js)
	mkdir -p $(BUILDDIR)
	$(UGLIFY) lib/async.js -mc > $(BUILDDIR)/async.min.js

test:
	$(NODEUNIT) test

clean:
	rm -rf $(BUILDDIR)

lint:
	$(JSHINT) lib/*.js test/*.js perf/*.js

.PHONY: test lint build all clean


.PHONY: release-major release-minor release-patch
release-major release-minor release-patch: all
	./support/sync-package-managers.js
	git add --force $(BUILDDIR)
	git ci -am "update minified build"
	@$(XYZ) --increment $(@:release-%=%)
