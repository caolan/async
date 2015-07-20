PACKAGE = asyncjs
CWD := $(shell pwd)
NODEUNIT = "$(CWD)/node_modules/.bin/nodeunit"
UGLIFY = "$(CWD)/node_modules/.bin/uglifyjs"
JSHINT = "$(CWD)/node_modules/.bin/jshint"
JSCS = "$(CWD)/node_modules/.bin/jscs"
XYZ = node_modules/.bin/xyz --repo git@github.com:caolan/async.git

BUILDDIR = dist
SRC = lib/async.js

all: clean test build

build: $(wildcard  lib/*.js)
	mkdir -p $(BUILDDIR)
	$(UGLIFY) $(SRC) -mc > $(BUILDDIR)/async.min.js
	cp $(SRC) $(BUILDDIR)/async.js

test:
	$(NODEUNIT) test

clean:
	rm -rf $(BUILDDIR)

lint:
	$(JSHINT) $(SRC) test/*.js perf/*.js
	$(JSCS) $(SRC) test/*.js perf/*.js

.PHONY: test lint build all clean


.PHONY: release-major release-minor release-patch
release-major release-minor release-patch: all
	./support/sync-package-managers.js
	git add --force $(BUILDDIR)
	git ci -am "update minified build"
	@$(XYZ) --increment $(@:release-%=%)
