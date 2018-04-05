const path = require('path');
const webpack = require('webpack');

const sourcePath = './public/src/';
const outputPath = './public/dist/';

const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlBeautifyPlugin = require('html-beautify-webpack-plugin');

const config = {
  context: path.resolve(__dirname, sourcePath),
  entry: {
    app: './js/index.js',
  },
  output: {
    filename: './js/bundle.js',
    path: path.resolve(__dirname, outputPath),
  },
  devServer: {
    contentBase: path.resolve(__dirname, sourcePath),
    watchContentBase: true,
    inline: true,
    hot: true,
  },
  devtool: process.env.NODE_ENV === 'development' ? 'source-map' : false,
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
    new CleanWebpackPlugin([outputPath]),
    new ExtractTextPlugin('./css/styles.css'),
    new FaviconsWebpackPlugin({
      logo: './img/favicon.png',
    }),
    new HtmlWebpackPlugin({
      template: './index.html',
      hash: true,
      inject: 'body',
      chunks: ['app'],
    }),
    new HtmlBeautifyPlugin({
      config: {
        html: {
          indent_size: 2,
          end_with_newline: true,
          preserve_newlines: true,
          unformatted: ['p', 'i', 'b', 'span'],
        },
      },
      replace: [' type="text/javascript"'],
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
