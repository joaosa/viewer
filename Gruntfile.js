'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        force: true
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib: {
        src: ['lib/**/*.js']
      }
      // test: {
      //   src: ['test/**/*.js']
      // },
    },
    simplemocha: {
      options: {
        uid: 'bdd',
        reporter: 'tap'
      },
      all: { src: ['test/**/*.js'] }
    },
    browserify: {
      'dist/bundle.js': ['lib/**/*.js'],
      options: {
        alias: ['lib/viewer.js:viewer']
      }
    },
    uglify: {
      options: {
        banner: grunt.file.read('LICENSE-MIT'),
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
    watchFiles: ['lib/**/*.js', 'test/**/*.js', 'index.html', 'Gruntfile.js'],
    watch: {
      files: '<%= watchFiles %>',
      tasks: ['base']
    },
    connect: {
      server: {
        options: {
          port: 9001,
          base: '.',
          keepalive: true
        }
      }
    },
    blanket: {
      instrument: {
        options: {
          debug: true
        },
        files: {
          'cov/': ['lib/']
        }
      }
    }
  });

  grunt.registerTask('server', 'Start a custom server.', function() {
    var done = this.async();
    var port = 9800;
    grunt.log.writeln('Starting a web server on port ' + port);

    var io = require('socket.io').listen(port).on('close', done);

    io.sockets.on('connection', function(socket) {
      var data = [
        {"type": "node", "id": "H"},
        {"type": "link", "source": "H", "target": "A"},
        {"type": "link", "source": "H", "target": "I"},
        {"type": "link", "source": "I", "target": "A"},
        {"type": "node", "id": "I"}
      ];
      var recursive = function() {
        socket.emit('data', {"data": [data[0]]});
        setTimeout(recursive, 1000);
      };
      
      // var recursive = function() {
      //   function aux(i) {
      //     i -= 1;
      //     socket.emit('data', {"data": [data[i]]});
      //     if (i === 0) { return; }
      //     setTimeout(aux(i), 1000);
      //   }
      //   aux(data.length);
      // };

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
        recursive();
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
  grunt.loadNpmTasks('grunt-blanket');

  // Default task.
  grunt.registerTask('test', ['blanket', 'simplemocha']);
  grunt.registerTask('base', ['jshint', 'test', 'browserify'/*, 'uglify'*/]);
  grunt.registerTask('default', ['base', 'watch']);
};
