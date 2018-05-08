module.exports = function (grunt) {

    grunt.initConfig({
        responsive_images: {
            dev: {
                options: {
                    engine: 'im',
                    sizes: [
                        {
                            width: 800,
                            suffix: '_large',
                        }, {
                            width: 640,
                            suffix: '_medium',
                            quality: 50,
                        }, {
                            width: 320,
                            suffix: '_small',
                            quality: 50,
                        },
                        {
                            width: 800,
                            suffix: '_large',
                            extname:'.webp'
                        }, {
                            width: 640,
                            suffix: '_medium',
                            quality: 50,
                            extname:'.webp'
                        }, {
                            width: 320,
                            suffix: '_small',
                            quality: 50,
                            extname:'.webp'
                        }]
                },
                files: [{
                    expand: true,
                    src: ['*.{gif,jpg,png}'],
                    cwd: 'img_src/',
                    dest: 'dist/img/'
                }]
            }
        },
    });

    grunt.loadNpmTasks('grunt-responsive-images');
    grunt.registerTask('default', ['responsive_images']);

};
