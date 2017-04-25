const path = require('path');

module.exports = {
  entry: `${__dirname}/public/src/index.js`,
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public', 'dist'),
  },
  devServer: {
    inline: true,
    contentBase: path.resolve(__dirname, 'public', 'dist'),
    port: 7777,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
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
            },
          ]],
        },
      },
    ],
  },
};
