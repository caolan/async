module.exports = function(config) {
    config.set({
        browsers: ['Firefox'],
        files: ['mocha_test/*.js'],
        frameworks: ['browserify', 'mocha'],
        preprocessors: {
            'mocha_test/*.js': ['browserify']
        },
        reporters: ['mocha'],
        singleRun: true,

        browserify: {
            debug: true,
            transform: ['babelify']
        },

        client: {
            mocha: {
                grep: '@nodeonly',
                invert: true
            }
        }
    });
};
