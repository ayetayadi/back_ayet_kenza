"use strict";

module.exports = function(grunt) {
  grunt.initConfig({
    //JSCS validator and linter
    jscs: {
        options: {
            config: "./.jscsrc",
            esnext: true, // If you use ES6 http://jscs.info/overview.html#esnext
            fix: true, // Autofix code style violations when possible.
            verbose: true // If you need output with rule names http://jscs.info/overview.html#verbose
        },
        src: [
              './Gruntfile.js',
              './index.js',
              './test/**/*.js',
              './command/**/*.js',
              './helper/**/*.js'
            ]
    },
    //Jshint syntax validator.
    jshint: {
      all: [
            './Gruntfile.js',
            './index.js',
            './test/**/*.js',
            './command/**/*.js',
            './helper/**/*.js'
          ],
      options: {
          jshintrc: './.jshintrc' // relative to Gruntfile
      }
    },
    //Mocha test runner check 'test' folder for all the specs.
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          quiet: false, // Optionally suppress output to standard out (defaults to false)
          clearRequireCache: true, // Optionally clear the require cache before running tests (defaults to false)
          colors: true
        },
        src: ['test/**/*.js']
      }
    },
    //Grunt file watch. if changes express:dev will restart.
    watch: {
      express: {
        files: ['**/*.js'],
        options: {
          spawn: false
        }
      },
      options: {
        livereload: true
      }
    }
  });

  //Load all task plugins.
  grunt.loadNpmTasks("grunt-jscs");
  grunt.loadNpmTasks('grunt-contrib-jshint');
  // Add the grunt-mocha-test tasks.
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-watch');

  //Register tasks
  grunt.registerTask('dev', ['jscs', 'jshint', 'mochaTest', 'watch']);
  grunt.registerTask('default', ['jscs', 'jshint', 'mochaTest']);
  grunt.registerTask('test', ['mochaTest']);
};
