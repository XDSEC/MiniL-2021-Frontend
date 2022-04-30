const {VueLoaderPlugin} = require('vue-loader');
const {} = require('@vue/cli-plugin-babel');
const CompressionWebpackPlugin = require('compression-webpack-plugin');
module.exports = {
    mode: 'production',
    entry: [
        './src/background.js',
    ],
    module: {
        rules: [{
            test: /\.vue$/,
            use: 'vue-loader',
        }, {
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: /node_modules/,
            query: {
                presets: ['stage-3', 'env', 'vue'],
            },
        }],
    },
    plugins: [
        new VueLoaderPlugin(),
        new CompressionWebpackPlugin({
            filename: '[path].gz[query]',
            algorithm: 'gzip',
            test: /\.js$|\.css$/,
        }),
    ],
};