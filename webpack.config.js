const path = require('path');
const webpack = require('webpack');
const fs = require('fs');
const glob = require('glob');

const sourcePath = './public/src/';
const outputPath = './public/dist/';

const copyStateLibs = fs.existsSync('./public/src/libs') && fs.lstatSync('./public/src/libs').isDirectory();
const copyStateFont = fs.existsSync('./public/src/font') && fs.lstatSync('./public/src/font').isDirectory();

console.log(`CopyWebpackPlugin(libs) : ${copyStateLibs}`);
console.log(`CopyWebpackPlugin(font) : ${copyStateFont}`);

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlBeautifyPlugin = require('@nurminen/html-beautify-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

// 이미지 압축
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

// 사이트 기본 정보 입력
const siteInfo = require('./site-info');

function generateHtmlPlugins(templateDir) {
  var templateFiles = glob.sync(`${templateDir}**/*.html`, { ignore: [`${templateDir}/_template/**/*.html`] }).map((file) => file.replace(templateDir, ''));
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
      filename: 'css/style.css',
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
          test: 'content="/img',
          with: argv.mode === 'development' ? 'content="/img' : `content="${siteInfo.og.img.url}img`,
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

  console.log('\n********************************************************************************');
  console.log(`🚀 Build Mode: ${argv.mode}`);
  console.log('********************************************************************************\n');

  return {
    context: path.resolve(__dirname, sourcePath),
    entry: {
      app: argv.mode === 'development' ? ['./css/development.scss', './css/style.scss', './js/app.js'] : ['./css/style.scss', './js/app.js'],
    },
    output: {
      filename: 'js/[name].js',
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
    stats: {
      preset: 'errors-only',
      builtAt: true,
      timings: true,
      version: true,
    },
    mode: argv.mode === 'development' ? 'development' : 'production',
    devtool: argv.mode === 'development' ? 'source-map' : false,
    optimization: {
      minimizer: [
        new TerserPlugin({
          extractComments: false,
        }),
        // 이미지 압축
        new ImageMinimizerPlugin({
          minimizer: {
            implementation: ImageMinimizerPlugin.squooshMinify,
            options: {
              encodeOptions: {
                mozjpeg: 'auto',
              },
            },
          },
        }),
      ],
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
          include: /img/,
          type: 'asset/resource',
          generator: {
            filename: argv.mode === 'development' ? 'img/[name][ext]' : 'img/[name][ext]?[hash]',
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
