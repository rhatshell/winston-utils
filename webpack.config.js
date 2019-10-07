const path = require('path');
const nodeExternals  = require('webpack-node-externals');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = function () {
  const isEnvProduction = true;
  const shouldUseSourceMap = true;

  return {
    context: path.resolve(__dirname, 'src'),
    entry: './index.ts',
    // target: 'web',
    // externals: [nodeExternals()],
    mode: isEnvProduction ? 'production' : isEnvDevelopment && 'development',
    // Stop compilation early in production
    bail: isEnvProduction,
    devtool: isEnvProduction
      ? shouldUseSourceMap
        ? 'source-map'
        : false
      : isEnvDevelopment && 'cheap-module-source-map',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'index.js',
      libraryTarget: 'umd'
    },
    resolve: {
      // Add `.ts` and `.tsx` as a resolvable extension.
      extensions: ['.ts', '.js'],
      plugins: [new TsconfigPathsPlugin({ configFile: './tsconfig.json' })]
    },
    module: {
      rules: [
        // all files with a `.ts` extension will be handled by `ts-loader`
        {
          test: /\.ts?$/,
          loader: 'ts-loader',
          exclude: [/node_modules/, /test/]
        }
      ]
    }
  };
};