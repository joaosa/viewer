'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib: {
        src: ['lib/**/*.js']
      },
      test: {
        src: ['test/**/*.js']
      },
    },
    simplemocha: {
      options: {
        globals: ['should'],
        uid: 'bdd',
        reporter: 'tap'
      },
      all: {
        src: 'test/**/*-test.js'
      }
    },    
    browserify: {
      dist: {
        requires: ['traverse'],
        entries: ['lib/**/*.js']
      }
    },
    uglify: {
      options: {
        // banner: grunt.file.read('LICENCE-MIT'),
        mangle: { toplevel: true },
        squeeze: { dead_code: false },
        codegen: { quote_keys: true }
      },
      dist: {
        files: {
          "dist/bundle.min.js": ["dist/bundle.js"]
        }       
      }
    },    
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      lib: {
        files: '<%= jshint.lib.src %>',
        tasks: ['jshint:lib', 'simplemocha']
      },
      test: {
        files: '<%= jshint.test.src %>',
        tasks: ['jshint:test', 'simplemocha']
      },
    },
  });

  // These plugins provide necessary tasks.  
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task.
  grunt.registerTask('default', ['jshint', 'simplemocha']);
};
