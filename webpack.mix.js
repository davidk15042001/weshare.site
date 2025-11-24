const mix = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel applications. By default, we are compiling the CSS
 | file for the application as well as bundling up all the JS files.
 |
 */
mix.webpackConfig({
    stats: {
        children: true,
    },
});

if (mix.inProduction()) {
    mix.js('resources/js/app.js', 'public/js')
        .react()
        .sass('resources/scss/app.scss', 'public/css')
        .version();
} else {
    mix.js('resources/js/app.js', 'public/js/app.dev.js')
        .sass('resources/scss/app.scss', 'public/css/app.dev.css')
        .react();
}
mix.alias({
    '@': 'resources/js',
});
