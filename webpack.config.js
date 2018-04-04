const webpack = require('webpack'); // to access built-in plugins
const path = require('path');

const config = {
  entry: `${__dirname}/public/src/index.js`,
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'public', 'dist'),
  },
  devServer: {
    inline: true,
    contentBase: path.join(__dirname, 'public', 'dist'),
    port: 7777,
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
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
          presets: [[
            'env', {
              targets: {
                browsers: ['last 2 versions'],
              },
              module: false, // Bundling 결과로부터 사용되지 않은 코드를 삭제하여 파일 크기 경량화
            },
          ]],
        },
      },
    ],
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin(),
  ],
};

module.exports = config;
