const path = require("path")
const webpack = require("webpack")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const PACKAGE = require('../package.json');

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "../dist"),
    filename: "bundle.js",
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /.*\.html$/,
        loader: 'raw-loader',
      },
      {
        test: /\.html$/,
        loader: 'string-replace-loader',
        options: {
          search: '%PROJECT_NAME%',
          replace: PACKAGE.name,
          flags: 'g'
        }
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      inject: "body",
      publicPath: "./"
    })
  ]
}