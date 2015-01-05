var package = require("./package.json");
var version = package.version;
module.exports = function(grunt) {
  grunt.initConfig({
    titaniumifier: {
      "module": {
        options: {
        },
        files: [{
          src:['.'],
          dest:'dist'
        }]
      }
    },
    shell: {
      target: {
        command: '(cd dist; unzip -p nano-commonjs-'+version+'.zip modules/commonjs/nano/'+version+'/nano.js > nano.js)'
      }
    }
  });

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.registerTask('default', 'build');
  grunt.registerTask('build', ['titaniumifier','shell']);
};


