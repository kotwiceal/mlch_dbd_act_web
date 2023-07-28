const webpack = require('webpack')
const path = require('path')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    mode: 'development',
    entry: {
        main: path.resolve(__dirname, './src/index.js'),
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].bundle.js',
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin(
            {
                template: path.resolve(__dirname, './src/index.html'),
                filename: 'main.html',
            }
        ),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.ProvidePlugin(
            {
                $: 'jquery',
                jQuery: 'jquery',
                Plotly: 'plotly.js-dist'
            }
        ),
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
}