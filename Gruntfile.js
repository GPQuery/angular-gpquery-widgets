module.exports = function (grunt) {
    'use strict';
    require('load-grunt-tasks')(grunt);
    grunt.initConfig({
        assetsDir: 'src',
        distDir: 'dist',
        availabletasks: {
            tasks: {
                options: {
                    filter: 'include',
                    groups: {
                        'Development': ['dev'],
                        'Production': ['package'],
                        'Continuous Integration': ['ci']
                    },
                    sort: [
                        'dev',
                        'test:unit',
                        'test:e2e',
                        'report',
                        'package',
                        'ci'
                    ],
                    descriptions: {
                        'dev': 'Launch the static server and watch tasks',
                        'package': 'Package your web app for distribution',
                        'ci': 'Run unit & e2e tests, package your webapp and generate reports. Use this task for Continuous Integration'
                    },
                    tasks: [
                        'dev',
                        'test:unit',
                        'test:e2e',
                        'report',
                        'package',
                        'ci'
                    ]
                }
            }
        },
        wiredep: {
            target: {
                src: '<%= assetsDir %>/index.html',
                ignorePath: '<%= assetsDir %>/',
                jsPattern: '<script type="text/javascript" src="{{filePath}}"></script>',
                cssPattern: '<link rel="stylesheet" href="{{filePath}}" >'
            }
        },
        clean: {
            dist: [
                '.tmp',
                '<%= distDir %>'
            ]
        },
        copy: {
            dist: {
                files: [{
                        expand: true,
                        dot: true,
                        cwd: '<%= assetsDir %>',
                        dest: '<%= distDir %>/',
                        src: [
                            'index.html',
                            'img/**'
                        ]
                    }]
            }
        },
        ngAnnotate: {
            options: {},
            dist: {
                files: [{
                        expand: true,
                        cwd: '.tmp/concat/js',
                        src: '*.js',
                        dest: '.tmp/concat/js'
                    }]
            }
        },
        htmlmin: {
            dist: {
                options: {
                    collapseWhitespace: true,
                    conservativeCollapse: true,
                    collapseBooleanAttributes: true,
                    removeComments: true,
                    removeCommentsFromCDATA: true,
                    removeOptionalTags: true
                },
                files: [{
                        expand: true,
                        cwd: '<%= distDir %>',
                        src: [
                            'index.html',
                            '**/*.html'
                        ],
                        dest: '<%= distDir %>'
                    }]
            }
        },
        useminPrepare: {
            html: '<%= assetsDir %>/index.html',
            options: { dest: '<%= distDir %>' }
        },
        usemin: { html: '<%= distDir %>/index.html' },
        browserSync: {
            dev: {
                bsFiles: {
                    src: [
                        '<%= assetsDir %>/**/*.html',
                        '<%= assetsDir %>/**/*.js',
                        '<%= assetsDir %>/**/*.css'
                    ]
                },
                options: {
                    watchTask: true,
                    ghostMode: {
                        clicks: true,
                        scroll: true,
                        links: false,
                        // must be false to avoid interfering with angular routing
                        forms: true
                    },
                    server: { baseDir: '<%= assetsDir %>' }
                }
            }
        },
        jshint: {
            options: { jshintrc: '.jshintrc' },
            all: { src: ['<%= assetsDir %>/js/**/*.js'] }
        },
        watch: {
            scss: {
                files: ['<%= assetsDir %>/**/*.scss'],
                tasks: ['sass:all']
            }
        },
        connect: {
            plato: {
                options: {
                    port: 8889,
                    base: 'reports/complexity',
                    keepalive: true,
                    open: true
                }
            }
        },
        csslint: {
            options: { csslintrc: '.csslintrc' },
            all: { src: ['<%= assetsDir %>/css/**/*.css'] }
        },
        concat: {
            dist: {
                src: ['<%= assetsDir %>/js/**/*.scss'],
                dest: '<%= assetsDir %>/scss/app.scss' 
            }
        },
        sass: {
            options: {
                style: 'expanded',
                trace: true
            },
            all: { files: { '<%= assetsDir %>/css/app.css': '<%= assetsDir %>/scss/app.scss' } }
        },
        rev: {
            dist: {
                files: {
                    src: [
                        '<%= distDir %>/js/{,*/}*.js',
                        '<%= distDir %>/css/{,*/}*.css'
                    ]
                }
            }
        },
        plato: {
            options: {
                jshint: grunt.file.readJSON('.jshintrc'),
                title: '<%= name %>'
            },
            all: { files: { 'reports/complexity': ['<%= assetsDir %>/js/**/*.js'] } }
        },
        imagemin: {
            dist: {
                options: {
                    optimizationLevel: 7,
                    progressive: false,
                    interlaced: true
                },
                files: [{
                        expand: true,
                        cwd: '<%= assetsDir %>/',
                        src: ['**/*.{png,jpg,gif}'],
                        dest: '<%= distDir %>/'
                    }]
            }
        },
        karma: {
            dev_unit: {
                options: {
                    configFile: 'test/conf/unit-test-conf.js',
                    background: true,
                    singleRun: false,
                    autoWatch: true,
                    reporters: ['progress']
                }
            },
            dist_unit: {
                options: {
                    configFile: 'test/conf/unit-test-conf.js',
                    background: false,
                    singleRun: true,
                    autoWatch: false,
                    reporters: [
                        'progress',
                        'coverage'
                    ],
                    coverageReporter: {
                        type: 'html',
                        dir: '../reports/coverage'
                    }
                }
            },
            e2e: { options: { configFile: 'test/conf/e2e-test-conf.js' } }
        }
    });
    grunt.registerTask('ls', ['availabletasks']);
    grunt.registerTask('package', [
        'jshint',
        'clean',
        'useminPrepare',
        'copy',
        'concat',
        'ngAnnotate',
        'uglify',
        'sass',
        'cssmin',
        'rev',
        'imagemin',
        'usemin',
        'htmlmin'
    ]);
    grunt.registerTask('ci', [
        'package',
        'connect:test',
        'karma:dist_unit:start',
        'karma:e2e',
        'plato'
    ]);
    grunt.registerTask('dev', [
        'concat',
        'sass',
        'browserSync',
        'karma:dev_unit:start',
        'watch'
    ]);
    grunt.registerTask('report', [
        'plato',
        'connect:plato'
    ]);
    grunt.registerTask('test:e2e', [
        'connect:test',
        'karma:e2e'
    ]);
    grunt.registerTask('test:unit', ['karma:dist_unit:start']);
};