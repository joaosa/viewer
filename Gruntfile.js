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
      'dist/bundle.js': {
        // requires: ['dist/*'],
        entries: ['lib/**/*.js'],
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
      files: ['**/lib/*', 'index.html', 'Gruntfile.js'],
      tasks: ['default']
    },    
    connect: {
      server: {
        options: {
          base: '.',
          keepalive: true
        }
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  // grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-connect');
  // grunt.loadNpmTasks('grunt-contrib-clean');

  // Default task.
  grunt.registerTask('default', [/*'jshint',*/ 'simplemocha', 'browserify', /*'uglify',*/ 'copy']);

};
