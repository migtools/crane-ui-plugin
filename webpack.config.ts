/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */

import * as webpack from 'webpack';
import * as path from 'path';
import { ConsoleRemotePlugin } from '@openshift-console/dynamic-plugin-sdk-webpack';
const { stylePaths } = require('./stylePaths');

const config: webpack.Configuration = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  context: path.resolve(__dirname, 'src'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename:
      process.env.NODE_ENV === 'production' ? '[name]-bundle-[hash].min.js' : '[name]-bundle.js',
    chunkFilename:
      process.env.NODE_ENV === 'production' ? '[name]-chunk-[chunkhash].min.js' : '[name]-chunk.js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(jpg|jpeg|png|gif)$/i,
        include: [
          path.resolve(__dirname, './src'),
          path.resolve(__dirname, './node_modules/patternfly'),
          path.resolve(__dirname, './node_modules/@patternfly/patternfly/assets/images'),
          path.resolve(__dirname, './node_modules/@patternfly/react-styles/css/assets/images'),
          path.resolve(
            __dirname,
            './node_modules/@patternfly/react-core/dist/styles/assets/images'
          ),
          path.resolve(
            __dirname,
            './node_modules/@patternfly/react-core/node_modules/@patternfly/react-styles/css/assets/images'
          ),
          path.resolve(
            __dirname,
            './node_modules/@patternfly/react-table/node_modules/@patternfly/react-styles/css/assets/images'
          ),
          path.resolve(
            __dirname,
            './node_modules/@patternfly/react-inline-edit-extension/node_modules/@patternfly/react-styles/css/assets/images'
          ),
        ],
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 5000,
              outputPath: 'images',
              name: '[name].[ext]',
            },
          },
        ],
        type: 'javascript/auto',
      },
      {
        test: /(\.jsx?)|(\.tsx?)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: path.resolve(__dirname, 'tsconfig.json'),
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
      },
    ],
  },
  plugins: [new ConsoleRemotePlugin()],
  devtool: 'source-map',
  optimization: {
    chunkIds: process.env.NODE_ENV === 'production' ? 'deterministic' : 'named',
    minimize: process.env.NODE_ENV === 'production' ? true : false,
  },
};

export default config;
