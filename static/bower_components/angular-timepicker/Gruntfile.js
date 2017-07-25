module.exports = function (grunt) {
  var taskConfig = {
    pkg: grunt.file.readJSON('package.json'),

    karma: {
      options: {
        configFile: 'karma.conf.js'
      },
      unit: {
        runnerPort: 9101,
        background: true
      },
      single: {
        singleRun: true
      }
    },

    uglify: {
      raw: {
        options: {
          beautify: true,
          sourceMap: false,
          mangle: false,
          compress: false,
          preserveComments: 'some',
          banner: ['/*!', ' * <%= pkg.name %> <%= pkg.version %>', ' * <%= pkg.homepage %>', ' * Copyright <%= grunt.template.today("yyyy") %>, <%= pkg.author.name %>', ' * Contributors: <%= pkg.contributors %>', ' * Licensed under: <%= pkg.license %>\n */\n\n'].join('\n')
        },
        files: {
          'dist/angular-timepicker.js': ['src/angular-timepicker.js']
        }
      },
      prod: {
        options: {
          sourceMap: true,
          mangle: true,
          compress: {
            drop_console: true
          },
          preserveComments: false,
          banner: '/*! <%= pkg.name %> <%= pkg.version %> | ' +
            '(c) <%= grunt.template.today("yyyy") %>, <%= pkg.author.name %> | ' +
            '<%= pkg.license %> */'
        },
        files: {
          'dist/angular-timepicker.min.js': ['dist/angular-timepicker.js']
        }
      }
    },

    clean: ['dist']
  };

  grunt.initConfig(taskConfig);

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('default', ['karma:single']);
  grunt.registerTask('build', [ 'karma:single', 'clean', 'uglify']);
};