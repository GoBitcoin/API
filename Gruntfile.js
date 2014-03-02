module.exports = function(grunt) {
  // Do grunt-related things in here
  //

  grunt.initConfig({
    watch: {
      hapi: {
        files: ['lib/*.{js, coffee}', 'lib/**/*.{js, coffee}'],
        tasks: ['hapi'],
        options: {
          spawn: false // Newer versions of grunt-contrib-watch might require this parameter.
        }
      }
    },

    hapi: {
      custom_options: {
        options: {
          server: require('path').resolve('./lib/api/index'),
          bases: {
            '/': '.'
          }
        }
      }
    }
  });

  grunt.registerTask('server', [
    'hapi',
    'watch'
  ]);

  grunt.loadNpmTasks('grunt-hapi');
  grunt.loadNpmTasks('grunt-contrib-watch');

};
