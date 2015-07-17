module.exports = function (config) {
  config.set({
    browsers: ['Firefox'],
    files: ['mocha_test/**/*_test.js'],
    frameworks: ['browserify', 'mocha'],
    preprocessors: {
      'mocha_test/**/*_test.js': ['browserify']
    },
    singleRun: true
  });
}
