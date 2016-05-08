module.exports = function(config) {
    config.set({
        browsers: ['Firefox'],
        files: [
            './node_modules/es5-shim/es5-shim.js',
            'mocha_test/*.js'
        ],
        frameworks: ['browserify', 'mocha'],
        preprocessors: {
            'mocha_test/*.js': ['browserify']
        },
        reporters: ['mocha'],
        singleRun: true,

        browserify: {
            debug: true,
            transform: ['babelify']
        }
    });
};
