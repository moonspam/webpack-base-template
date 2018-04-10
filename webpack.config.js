const path = require('path');
const webpack = require('webpack');

const sourcePath = './public/src/';
const outputPath = './public/dist/';

const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlBeautifyPlugin = require('html-beautify-webpack-plugin');

const siteInfo = {
  // Insert here
  author: 'moonspam',
  title: 'Webpack Base Template',
  description: 'This is Webpack Base Template',
  keywords: 'Webpack,Template,HTML,Sass',
  og: {
    locale: 'ko_KR',
    url: 'https://rawgit.com/moonspam/webpack-base-template/master/public/dist/index.html',
    type: 'website',
    img: {
      url: 'https://raw.githubusercontent.com/moonspam/webpack-base-template/master/public/dist/',
      type: 'image/jpeg',
      width: '1280',
      height: '720',
      alt: 'alternate text',
    },
  },
};

const config = {
  context: path.resolve(__dirname, sourcePath),
  entry: {
    app: './js/index.js',
  },
  output: {
    filename: './js/[name].bundle.js',
    path: path.resolve(__dirname, outputPath),
  },
  devServer: {
    open: true,
    contentBase: path.resolve(__dirname, outputPath),
    watchContentBase: true,
    inline: true,
  },
  devtool: process.env.NODE_ENV === 'development' ? 'source-map' : false,
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          use: [{
            loader: 'css-loader',
            options: {
              minimize: true,
            },
          }, {
            loader: 'sass-loader',
          }],
          fallback: 'style-loader',
          publicPath: '../',
        }),
      },
      {
        test: /\.(jpe?g|png|gif)$/,
        exclude: /node_modules/,
        loader: 'file-loader',
        options: {
          name: () => {
            if (process.env.NODE_ENV === 'development') {
              return '[path][name].[ext]';
            }
            return '[hash].[ext]';
          },
          outputPath: './img/',
        },
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
      emitStats: false,
      icons: {
        android: false,
        appleIcon: true,
        appleStartup: false,
        coast: false,
        favicons: true,
        firefox: false,
        windows: false,
        yandex: false,
      },
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
      replace: [
        { test: '@@_title', with: siteInfo.title },
        { test: '@@_description', with: siteInfo.description },
        { test: '@@_keywords', with: siteInfo.description },
        { test: '@@_author', with: siteInfo.author },
        { test: '@@_og_locale', with: siteInfo.og.locale },
        { test: '@@_og_url', with: siteInfo.og.url },
        { test: '@@_og_type', with: siteInfo.og.type },
        { test: '@@_og_img_url', with: siteInfo.og.img.url },
        { test: '@@_og_img_type', with: siteInfo.og.img.type },
        { test: '@@_og_img_width', with: siteInfo.og.img.width },
        { test: '@@_og_img_height', with: siteInfo.og.img.height },
        { test: '@@_og_img_alt', with: siteInfo.og.img.alt },
      ],
    }),
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
