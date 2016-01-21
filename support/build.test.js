// Smoke test for the CJS build
var methods = ["each", "waterfall", "queue", "eachSeries"];
var expect = require('chai').expect;

describe("async main", function() {
    var async;

    before(function() {
        async = require("../build/");
    });

    it("should have methods", function() {
        methods.forEach(function(methodName) {
            expect(async[methodName]).to.be.a("function");
        });
    });
});

describe("async umd", function() {
    var async;

    before(function() {
        async = require("../build/async.js");
    });

    it("should have methods", function() {
        methods.forEach(function(methodName) {
            expect(async[methodName]).to.be.a("function");
        });
    });
});

describe("async umd minified", function() {
    var async;

    before(function() {
        async = require("../build/async.min.js");
    });

    it("should have methods", function() {
        methods.forEach(function(methodName) {
            expect(async[methodName]).to.be.a("function");
        });
    });
});

methods.forEach(function (methodName) {
    describe("async." + methodName, function () {
        var method;
        before(function () {
            method = require("../build/" + methodName);
        });

        it("should require the individual method", function() {
            expect(method).to.be.a("function");
        });
    });
});
