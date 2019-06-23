# This makefile is meant to be run on OSX/Linux.  Make sure any dist/ artifacts
# created here are checked in so people on all platforms can run npm scripts.
# This build should be run once per release.

SHELL=/bin/bash
export PATH := ./node_modules/.bin/:$(PATH):./bin/

PACKAGE = asyncjs
REQUIRE_NAME = async
XYZ = support/xyz.sh --repo git@github.com:caolan/async.git

BUILDDIR = build
BUILD_ES = build-es
DIST = dist
JS_INDEX = lib/index.js
SCRIPTS = ./support
JS_SRC := $(shell find lib/ -type f -name '*.js') lib/index.js lib/asyncify.js
INDEX_SRC := $(filter-out $(JS_INDEX),$(JS_SRC)) $(SCRIPTS)/index-template.js $(SCRIPTS)/aliases.txt ${SCRIPTS}/generate-index.js
LINT_FILES := lib/ test/ $(shell find perf/ -maxdepth 2 -type f) $(shell find support/ -maxdepth 2 -type f -name "*.js") karma.conf.js

UMD_BUNDLE := $(BUILDDIR)/dist/async.js
UMD_BUNDLE_MIN := $(BUILDDIR)/dist/async.min.js
MJS_BUNDLE := $(BUILDDIR)/dist/async.mjs
# UMD_BUNDLE_MAP := $(BUILDDIR)/dist/async.min.map
ALIAS_ES := $(addprefix build-es/, $(addsuffix .js, $(shell cat $(SCRIPTS)/aliases.txt | cut -d ' ' -f1)))
ALIAS_CJS := $(patsubst build-es/%, build/%, $(ALIAS_ES))
ES_MODULES := $(patsubst lib/%.js, build-es/%.js, $(JS_SRC)) $(ALIAS_ES)
CJS_MODULES := $(patsubst lib/%.js, build/%.js,  $(JS_SRC)) $(ALIAS_CJS)

define ALIAS_SRC =
$(shell cat $(SCRIPTS)/aliases.txt | grep "$(basename $(notdir $(1))) " | cut -d" " -f2 )
endef

define COMPILE_ALIAS =
SRC_$(A) := lib/$(call ALIAS_SRC,$(A)).js
$(A): $$(SRC_$(A))
	mkdir -p "$$(@D)"
	node $$(SCRIPTS)/build/compile-module.js --file $$< --output $$@
endef
$(foreach A,$(ALIAS_CJS),$(eval $(COMPILE_ALIAS)))

define COPY_ES_ALIAS =
SRC_$(A) := lib/$(call ALIAS_SRC,$(A)).js
$(A): $$(SRC_$(A))
	mkdir -p "$$(@D)"
	cp $$< $$@
endef
$(foreach A,$(ALIAS_ES),$(eval $(COPY_ES_ALIAS)))

all: lint build test

test:
	npm test

clean:
	rm -rf $(BUILDDIR)
	rm -rf $(BUILD_ES)
	rm -rf $(DIST)
	rm -rf $(JS_INDEX)
	rm -rf tmp/ .nyc_output/ coverage/
	rm -rf perf/versions/

lint:
	eslint --fix $(LINT_FILES)

# Compile the ES6 modules to singular bundles, and individual bundles
build-bundle: build-modules $(UMD_BUNDLE) $(MJS_BUNDLE)

build-modules: $(CJS_MODULES)

$(JS_INDEX): $(INDEX_SRC)
	node $(SCRIPTS)/generate-index.js > $@

$(BUILDDIR)/%.js: lib/%.js
	mkdir -p "$(@D)"
	node $(SCRIPTS)/build/compile-module.js --file $< --output $@


$(UMD_BUNDLE): $(ES_MODULES) package.json
	mkdir -p "$(@D)"
	node $(SCRIPTS)/build/aggregate-bundle.js

$(MJS_BUNDLE): $(ES_MODULES) package.json
	mkdir -p "$(@D)"
	node $(SCRIPTS)/build/aggregate-module.js

# Create the minified UMD versions and copy them to dist/ for bower
build-dist: $(DIST) $(DIST)/async.js $(DIST)/async.min.js # $(DIST)/async.min.map

$(DIST):
	mkdir -p $@

$(UMD_BUNDLE_MIN): $(UMD_BUNDLE)
	mkdir -p "$(@D)"
	babel-minify $< --mangle -o $@

$(DIST)/async.js: $(UMD_BUNDLE)
	cp $< $@

$(DIST)/async.min.js: $(UMD_BUNDLE_MIN)
	cp $< $@

# $(DIST)/async.min.map: $(UMD_BUNDLE_MIN)
# 	cp $(UMD_BUNDLE_MAP) $@

build-es: $(ES_MODULES)

$(BUILD_ES)/%.js: lib/%.js
	mkdir -p "$(@D)"
	cat $< > $@

test-build: $(UMD_BUNDLE) $(UMD_BUNDLE_MIN) $(ES_MODULES) $(CJS_MODULES)
	mocha support/build.test.js

build-config: $(BUILDDIR)/package.json $(BUILDDIR)/bower.json $(BUILDDIR)/README.md $(BUILDDIR)/LICENSE $(BUILDDIR)/CHANGELOG.md

build-es-config: $(BUILD_ES)/package.json $(BUILD_ES)/README.md $(BUILD_ES)/LICENSE $(BUILD_ES)/CHANGELOG.md

$(BUILDDIR)/package.json: package.json
	mkdir -p "$(@D)"
	support/sync-cjs-package.js > $@

$(BUILDDIR)/%: %
	mkdir -p "$(@D)"
	cp $< $@

$(BUILD_ES)/package.json: package.json
	mkdir -p "$(@D)"
	support/sync-es-package.js > $@

$(BUILD_ES)/README.md: README.es.md
	mkdir -p "$(@D)"
	cp $< $@

$(BUILD_ES)/%: %
	mkdir -p "$(@D)"
	cp $< $@

.PHONY: build-modules build-bundle build-dist build-es build-config build-es-config test-build

build: build-bundle build-dist build-es build-config build-es-config test-build

.PHONY: test lint build all clean

.PHONY: release-major release-minor release-patch release-prerelease
release-major release-minor release-patch release-prerelease:
	$(MAKE) clean
	$(MAKE) all
	npm ci # ensure dependencies are up to date (#1158)
	git add --force $(DIST)
	git commit -am "Update built files"; true
	$(XYZ) --increment $(@:release-%=%)
	# build again to propagate the version
	$(MAKE) build-config
	$(MAKE) build-es-config
	cd build/ && npm publish
	cd build-es/ && npm publish
	$(MAKE) publish-doc

.PHONY: doc publish-doc
doc:
	jsdoc -c ./support/jsdoc/jsdoc.json
	node support/jsdoc/jsdoc-fix-html.js

publish-doc: doc

.PHONY: list
list:
	@$(MAKE) -pRrq -f $(lastword $(MAKEFILE_LIST)) : 2>/dev/null | awk -v RS= -F: '/^# File/,/^# Finished Make data base/ {if ($$1 !~ "^[#.]") {print $$1}}' | sort | egrep -v -e '^[^[:alnum:]]' -e '^$@$$'
