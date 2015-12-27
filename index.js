'use strict';

var child_process = require('child_process');
var fs = require('fs');
var path = require('path');
var Mocha = require('mocha');

var glob = require('glob');
var statSync = require('fs').statSync;
var Reporter = require('./lib/reporter');
var Watcher = require('./lib/watcher');

module.exports = function MochaParallelTests(options) {
    var _dir = String(options._);

    process.setMaxListeners(0);

    options._.forEach(function (testPath) {
        var isDirectory = statSync(testPath).isDirectory();
        if (isDirectory) {
            testPath = testPath + '/**/*.js';
        }

        glob(testPath, function (err, files) {
            if (err) {
                throw err;
            }

            // watcher monitors running files
            // and is also an EventEmitter instance
            var watcher = new Watcher(options.maxParallel);

            files.map(function (file) {
                return path.resolve(file);
            }).forEach(function (file, index) {
                options.reporterName = (options.R || options.reporter);
                options.reporter = Reporter;
                options.index = index + 1;
                options.testsLength = files.length;

                watcher.addTest(file, options);
            });

            watcher.run();
        });
    });
};
