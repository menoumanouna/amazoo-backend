const webpack = require("webpack");
const nodeExternals = require("webpack-node-externals");
const path = require("path");

const isDev = process.env.NODE_ENV;
console.log("++++++++++++++++++++++process.env.NODE_ENV", process.env.NODE_ENV);
module.exports = {
  mode: process.env.NODE_ENV,
  context: path.resolve(__dirname, "."),
  target: "node",
  node: {
    __dirname: true,
  },
  externals: [nodeExternals()],
  entry: {
    index: "./index.js",
  },
  resolve: {
    extensions: [".js"],
  },
  plugins: [
    new webpack.BannerPlugin({ banner: "#!/usr/bin/env node", raw: true }),
  ],
  devtool: isDev ? "inline-source-map" : undefined,
  output: {
    path: path.join(__dirname, isDev ? "dev" : "dist"),
    filename: (chunkData) =>
      chunkData.chunk.name === "stupi" ? "[name]" : "[name].bundle.js",
    libraryTarget: "commonjs2",
    devtoolModuleFilenameTemplate: "[absolute-resource-path]",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/node_modules/, /database/],
        use: "babel-loader",
      },
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: [/node_modules/, /database/],
      },
      {
        test: /\.html$/,
        use: "html-loader",
      },
    ],
  },
};
