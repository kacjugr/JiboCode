var path = require('path');

var appRoot = './';

module.exports = {
    root: appRoot,
    source: appRoot + '**/*.js',
    html: appRoot + '**/*.html',
    style: 'css/**/*.css',
    output: 'dist/'
};
