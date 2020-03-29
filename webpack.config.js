const path = require('path');
const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');

const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';

  const cssLoader = {
    loader: 'css-loader',
    options: {
      modules: true,
      sourceMap: true,
      importLoaders: 1,
    }
  };

  return {
    mode: isProd ? 'production' : 'development',
    devtool: isProd ? 'source-map' : 'cheap-module-source-map',
    stats: 'minimal',

    devServer: {
      contentBase: path.join(__dirname, 'dist'),
      compress: true,
      hot: !isProd,
      port: 9000,
    },

    entry: {
      main: './src/index.ts',
    },

    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },

    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.css', '.scss', '.sass'],
    },

    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new CopyPlugin([
        { from: './src/manifest.json', to: './manifest.json' },
      ]),
      new MiniCssExtractPlugin({
        filename: '[name].css',
      }),
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: 'src/index.html',
      }),
    ],

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
        },
        {
          test: /\.js$/,
          use: 'source-map-loader',
          exclude: /\bnode_modules\b/,
        },
        {
          test: /\.s[ac]ss$/,
          use: isProd
            ? [{ loader: MiniCssExtractPlugin.loader, options: { sourceMap: true } }, cssLoader, 'sass-loader']
            : ['style-loader', cssLoader, 'sass-loader'],
        },
        {
          test: /\.css$/,
          use: isProd
            ? [MiniCssExtractPlugin.loader, cssLoader]
            : ['style-loader', cssLoader],
        },
      ],
    },
  };
};
