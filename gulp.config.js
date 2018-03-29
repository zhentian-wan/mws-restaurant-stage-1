module.exports = {
    app_file: {
        js_main_src: [
            './js/main.js',
            './js/dbhelper.js'
        ],
        js_restaurant_src: [
            './js/restaurant_info.js',
            './js/dbhelper.js'
        ],
        libs: './libs/**/*.js',
        scss_src: './scss/**/*.scss',
        index_src: './img_src',
        html_src: './*.html',
        img_src: './img_src/*.jpg',
        sw_src: './sw.js',
    },
    build: {
        dir: './dist',
        build_css: './dist/css',
        build_html: './dist',
        build_img: './dist/img',
        build_js: './dist/js',
        build_data: './dist/data',
        build_libs: './dist/libs',
    },
};
