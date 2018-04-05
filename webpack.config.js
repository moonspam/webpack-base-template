const path = require('path');
const webpack = require('webpack');

const srcPath = './public/src/';
const distPath = './public/dist/';

const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const config = {
  context: path.resolve(__dirname, srcPath),
  entry: {
    app: './js/index.js',
  },
  output: {
    filename: './js/bundle.js',
    path: path.resolve(__dirname, distPath),
  },
  devServer: {
    contentBase: './dist/',
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'sass-loader'],
        }),
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ['babel-preset-env'],
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin([distPath]),
    new ExtractTextPlugin('./css/styles.css'),
    new HtmlWebpackPlugin({
      template: './index.html',
      hash: true,
      inject: 'body',
      chunks: ['app'],
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
    }),
  ],
};

module.exports = config;
