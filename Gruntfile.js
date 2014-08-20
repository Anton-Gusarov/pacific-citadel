module.exports = function(grunt) {
    var currentPath = __dirname || "/Users/anton/polling";

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                stripBanners: true,
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %> */',
            },
            libs_min: {
                src: [
                    'bower_components/jquery/dist/jquery.min.js',
                    'bower_components/jqueryui/ui/minified/core.min.js',
                    'bower_components/jqueryui/ui/minified/widget.min.js',
                    'bower_components/jqueryui/ui/minified/mouse.min.js',
                    'bower_components/jqueryui/ui/minified/draggable.min.js',
                    'bower_components/handlebars/handlebars.min.js',
                    'bower_components/bootstrap/dist/js/bootstrap.min.js'
                ],
                dest: 'static/build/a.bundle.js'
            },
            final:{
                src:[
                    'static/build/a.bundle.js',
                    'static/build/b.bundle.js',
                    'static/build/r.build.js'
                ],
                dest: 'static/build/bundle.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            libs: {
                files:{
                    'static/build/b.bundle.js': [
                        'bower_components/underscore/underscore.js',
                        'bower_components/backbone/backbone.js',
                        'bower_components/backbone.marionette/lib/backbone.marionette.js',
                        'bower_components/almond/almond.js'
                    ]
                }
            }
        },
        requirejs: {
            compile: {
                options: {
                    optimize:"none",
                    baseUrl: "./static/js",
                    name: "./script",
                    include: "./app",
                    out: "./static/build/r.build.js",
                    paths: {
                        text: '../../bower_components/requirejs-text/text'
                    }
                }
            }
        },
        "regex-replace": {
            ts: { //specify a target with any name
                src: ['views/index.prod.html'],
                actions: [
                    {
                        name: 'ts',
                        search: '{{ts}}',
                        replace: (new Date()).getTime()
                    }
                ]
            }
        },
        copy: {
            main: {
                src: 'views/index.prod.template.html',
                dest: 'views/index.prod.html',
                options: {
                    process: function (content, srcpath) {
                        return content.replace(/\{\{ts\}\}/,(new Date()).getTime());
                    }
                }
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-regex-replace');
    grunt.loadNpmTasks('grunt-contrib-copy');

    // Default task(s).
    grunt.registerTask('default', ['concat:libs_min', 'uglify', 'requirejs', 'concat:final']);

};