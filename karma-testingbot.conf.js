var customLaunchers = {
    'TB_Chrome': {
      base: 'TestingBot',
      browserName: 'chrome',
      version: 42
  }/*,
  'TB_Firefox': {
      base: 'TestingBot',
      browserName: 'firefox'
  },
  'TB_Safari': {
      base: 'TestingBot',
      browserName: 'safari'
  },
  'TB_Edge': {
      base: 'TestingBot',
      browserName: 'microsoftedge'
  },
  'TB_Edge': {
      base: 'TestingBot',
      browserName: 'microsoftedge'
  },
  'TB_IE11': {
      base: 'TestingBot',
      browserName: 'internet explorer',
      version: 11
  },
  'TB_IE10': {
      base: 'TestingBot',
      browserName: 'internet explorer',
      version: 10
  },
  'TB_IE9': {
      base: 'TestingBot',
      browserName: 'internet explorer',
      version: 9
  },
  'TB_IE8': {
      base: 'TestingBot',
      browserName: 'internet explorer',
      version: 8
  }*/
};

module.exports = function(config) {
    config.set({
        customLaunchers: customLaunchers,
        browsers: Object.keys(customLaunchers),
        // we currently are allowed to spawn 15 concurrent vms on testing bot
        concurrency: 15,

        testingbot: {
            testName: 'Async.js TestingBot suite',
            recordScreenshots: false,
            connectOptions: {
                verbose: false,
                'se-port': 4445,
                logfile: 'testingbot_tunnel.log'
            },
            public: true
        },
        // up the no activity timeout in case of traffic
        browserNoActivityTimeout: 10000,


        files: [
            './node_modules/es5-shim/es5-shim.js',
            'mocha_test/*.js'
        ],
        frameworks: ['browserify', 'mocha'],
        preprocessors: {
            'mocha_test/*.js': ['browserify']
        },
        reporters: ['mocha', 'testingbot'],
        singleRun: true,

        browserify: {
            debug: true,
            transform: ['babelify']
        }
    });
};
