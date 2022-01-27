const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const glob = require('glob');

const sourcePath = './public/src/';
const outputPath = './public/dist/';

const copyStateLibs = fs.existsSync('./public/src/libs') && fs.lstatSync('./src/libs').isDirectory();
const copyStateFont = fs.existsSync('./public/src/font') && fs.lstatSync('./src/font').isDirectory();

console.log(`CopyWebpackPlugin(libs) : ${copyStateLibs}`);
console.log(`CopyWebpackPlugin(font) : ${copyStateFont}`);

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlBeautifyPlugin = require('@nurminen/html-beautify-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

// 사이트 기본 정보 입력
const siteInfo = require('./site-info');

function generateHtmlPlugins(templateDir) {
  var templateFiles = glob.sync(`${templateDir}**/*.html`).map((file) => file.replace(templateDir, ''));
  console.log(templateFiles);
  return templateFiles.map((file) => new HtmlWebpackPlugin({
    template: `./${file}`,
    filename: `${file}`,
    minify: false,
    hash: true,
    inject: 'body',
    chunks: 'all',
  }));
}

module.exports = (env, argv) => {
  // Webpack 플러그인
  const plugins = [
    new ESLintPlugin(),
    new CleanWebpackPlugin({
      protectWebpackAssets: false,
    }),
    new MiniCssExtractPlugin({
      filename: './css/style.css',
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
    }),
  ];

  // html의 개수에 따라 HtmlWebpackPlugin 생성
  const htmlList = generateHtmlPlugins(sourcePath);

  // HtmlWebpackPlugin 확장 플러그인
  const htmlPlugins = [
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
        {
          test: '="/./',
          with: '="/',
        },
      ],
    }),
  ];

  function copyPlugin() {
    let val = [];
    if (copyStateLibs && !copyStateFont) {
      val = [
        new CopyWebpackPlugin({
          patterns: [
            {
              from: './libs/**/*',
            },
          ],
        }),
      ];
    }
    if (!copyStateLibs && copyStateFont) {
      val = [
        new CopyWebpackPlugin({
          patterns: [
            {
              from: './font/**/*',
            },
          ],
        }),
      ];
    }
    if (copyStateLibs && copyStateFont) {
      val = [
        new CopyWebpackPlugin({
          patterns: [
            {
              from: './libs/**/*',
            },
            {
              from: './font/**/*',
            },
          ],
        }),
      ];
    }
    return val;
  }

  return {
    context: path.resolve(__dirname, sourcePath),
    entry: {
      app: argv.mode === 'development' ? ['./css/development.scss', './css/style.scss', './js/app.js'] : ['./css/style.scss', './js/app.js'],
    },
    output: {
      filename: './js/[name].js',
      path: path.resolve(__dirname, outputPath),
      publicPath: '/',
    },
    target: ['web', 'es5'],
    devServer: {
      static: {
        directory: path.resolve(__dirname, sourcePath),
        watch: true,
      },
      open: true,
    },
    infrastructureLogging: {
      level: 'warn',
    },
    mode: argv.mode === 'development' ? 'development' : 'production',
    devtool: argv.mode === 'development' ? 'source-map' : false,
    optimization: {
      minimize: argv.mode === 'production',
    },
    performance: {
      hints: argv.mode === 'production' ? 'warning' : false,
    },
    module: {
      rules: [
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            argv.mode === 'development' ? 'style-loader'
              : {
                loader: MiniCssExtractPlugin.loader,
                options: {
                  publicPath: argv.mode === 'development' ? '/' : '../',
                },
              },
            'css-loader',
            {
              loader: 'sass-loader',
              options: {
                // eslint-disable-next-line global-require
                implementation: require('sass'),
              },
            },
          ],
        },
        {
          test: /\.(jpe?g|png|gif)$/,
          exclude: /node_modules/,
          loader: 'file-loader',
          options: {
            name: argv.mode === 'development' ? '[path][name].[ext]' : '[path][name].[ext]?[hash]',
            esModule: false,
          },
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          options: {
            configFile: './.babelrc',
          },
        },
      ],
    },
    plugins: plugins.concat(copyPlugin()).concat(htmlList).concat(htmlPlugins),
  };
};
