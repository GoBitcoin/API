module.exports = function (grunt) {
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
    },

    shell: {
      pullSubmodules: {
        otpions: {
          stdout: true
        },
        command: 'git submodule foreach git pull'
      },
      compileBitcoinProto: {
        options: { // Options
          stdout: true
        },
        command: 'protoc --descriptor_set_out=lib/api/protos/bitcoin.desc --include_imports lib/api/protos/bitcoin.proto'
      },
      compilePaymentRequestProto: {
        options: { // Options
          stdout: true
        },
        command: 'protoc --descriptor_set_out=lib/api/protos/paymentrequest.desc --include_imports lib/api/protos/paymentrequest.proto'
      },
      compileBitcoinServerProto: {
        options: { // Options
          stdout: true
        },
        command: 'protoc --descriptor_set_out=lib/api/protos/bitcoinserver.desc --include_imports lib/api/protos/bitcoinserver.proto --proto_path lib/api/protos/'
      }
    }
  });

  grunt.registerTask('build', [
    'shell'
  ]);

  grunt.registerTask('server', [
    'hapi',
    'watch'
  ]);

  grunt.loadNpmTasks('grunt-hapi');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-shell');

};