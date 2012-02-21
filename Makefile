PACKAGE = asyncjs
NODEJS = $(if $(shell test -f /usr/bin/nodejs && echo "true"),nodejs,node)
CWD := $(shell pwd)
WITH_NODEUNIT = PATH=$(CWD)/node_modules/nodeunit/bin:$(PATH)
WITH_UGLIFY = PATH=$(CWD)/node_modules/uglify-js/bin:$(PATH)
WITH_NODELINT = PATH=$(CWD)/node_modules/nodelint/bin:$(PATH)

BUILDDIR = dist

all: clean test build

build: $(wildcard  lib/*.js)
	mkdir -p $(BUILDDIR)
	$(WITH_UGLIFY) uglifyjs lib/async.js > $(BUILDDIR)/async.min.js

test:
	$(WITH_NODEUNIT) nodeunit test

clean:
	rm -rf $(BUILDDIR)

lint:
	$(WITH_NODELINT) nodelint --config nodelint.cfg lib/async.js

.PHONY: test build all
