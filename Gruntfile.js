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
        requires: ['./lib/viewer.js'],
        // entries: ['lib/**/*.js']
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
  
  grunt.registerTask('server', 'Start a custom server.', function() {
    var done = this.async();
    var port = 9000;
    grunt.log.writeln('Starting a web server on port ' + port);

    var io = require('socket.io').listen(port).on('close', done);    
    
    io.sockets.on('connection', function(socket) {
      var recursive = function () {
          socket.emit('stream', {"stream": [{"type": "node", "id": "H"}/*, {"type": "link", "source": "H", "target": "A"}*/]});
          setTimeout(recursive, 1000);
      };
      recursive();

      socket.on('ready', function() {          
          socket.emit('data', {
          "nodes": [
            {"id": "A"},
            {"id": "B"},
            {"id": "C"},
            {"id": "D"},
            {"id": "E"},
            {"id": "F"},
            {"id": "G"}
          ],
          "links": [
            {"source": "A", "target": "B"},
            {"source": "B", "target": "C"},
            {"source": "A", "target": "D"},
            {"source": "B", "target": "E"},
            {"source": "C", "target": "E"},
            {"source": "D", "target": "E"},
            {"source": "E", "target": "F"},
            {"source": "F", "target": "G"}]
        });
      });
    });
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-connect');

  // Default task.
  grunt.registerTask('default', [/*'jshint',*/ 'simplemocha', 'browserify', 'connect'/*, 'uglify'*/]);

};
