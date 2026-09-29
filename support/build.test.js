// Smoke test for the CJS build
var methods = ["each", "waterfall", "queue", "eachSeries", "forEachOf"];
var {expect} = require('chai');
var {rollup} = require('rollup');
var {nodeResolve: rollupPluginNodeResolve} = require('@rollup/plugin-node-resolve');
var fs = require('fs');
var {exec} = require('child_process');

describe("async main", () => {
    var async;

    before(() => {
        async = require("../build/");
    });

    it("should have methods", () => {
        methods.forEach((methodName) => {
            expect(async[methodName]).to.be.a("function");
        });
    });
});

describe("async umd", () => {
    var async;

    before(() => {
        async = require("../build/dist/async.js");
    });

    it("should have methods", () => {
        methods.forEach((methodName) => {
            expect(async[methodName]).to.be.a("function");
        });
    });
});

describe("async cjs vs umd", () => {
    it("should expose the same names in both builds", () => {
        // The UMD bundle is rolled up straight from the ES sources, the CJS
        // modules go through Babel: the two export lists must not drift.
        var cjs = require("../build/");
        var umd = require("../build/dist/async.js");
        expect(Object.keys(cjs).sort()).to.eql(Object.keys(umd).sort());
    });
});

describe("async umd minified", () => {
    var async;

    before(() => {
        async = require("../build/dist/async.min.js");
    });

    it("should have methods", () => {
        methods.forEach((methodName) => {
            expect(async[methodName]).to.be.a("function");
        });
    });
});

methods.forEach((methodName) => {
    describe("async." + methodName, () => {
        var method;
        before(() => {
            method = require("../build/" + methodName);
        });

        it("should require the individual method", () => {
            expect(method).to.be.a("function");
        });
    });
});

describe("ES Modules", () => {
    var tmpDir = __dirname + "/../tmp";
    var buildFile = __dirname + "/../tmp/es.test.js";

    before((done) => {
        if (fs.existsSync(tmpDir)) {
            return done();
        }
        fs.mkdir(tmpDir, done);
    });

    before(() => {
        return rollup({
            input: __dirname + "/es.test.js",
            plugins: [
                rollupPluginNodeResolve()
            ]
        }).then((bundle) => {
            return bundle.write({
                format: "umd",
                file: buildFile
            });
        });
    });

    it("should build a successful bundle", (done) => {
        exec("node " + buildFile, (err, stdout) => {
            if (err) { return done(err); }
            expect(stdout).to.match(/42/);
            done();
        });
    });
});
