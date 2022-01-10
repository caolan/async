module.exports = function(config) {
    config.set({
        browsers: ['Firefox'],
        files: ['test/*.js'],
        frameworks: ['browserify', 'mocha'],
        plugins: [
            'karma-browserify',
            'karma-mocha',
            'karma-mocha-reporter',
            'karma-firefox-launcher',
            'karma-safari-launcher'
        ],
        preprocessors: {
            'test/*.js': ['browserify'],
            'lib/*.js': ['browserify']
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
