import babel from '@rollup/plugin-babel';
import resolve, { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import svgr from '@svgr/rollup';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';
import image from '@rollup/plugin-image';
import copy from 'rollup-plugin-copy';

export default {
  input: 'src/index.js',
  output: [
    {
      format: 'cjs',
      dir: 'dist/cjs',
      sourcemap: true,
    },
    {
      dir: 'dist',
      format: 'esm',
      sourcemap: true,
    },
  ],
  external: [
    'react',
    'react-native',
    'react-dom',
    'react-redux',
    'react-native-fs',
    'styled-components',
    'rn-fetch-blob',
    'realm',
    'native-base',
    '@react-native-community/cameraroll',
    'react-native-svg',
    'react-native-video',
    'react-native-sound',
    'moment',
    'react-native-screens',
    'prop-types',
    'react-native-camera',
    'react-native-image-zoom-viewer',
    'react-native-compressor',
    'react-native-document-picker',
    '@react-navigation/native',
    '@react-navigation/native-stack',
    'react-native-swipe-list-view',
    'react-native-mov-to-mp4',
    'react-native-safe-area-context',
  ],
  plugins: [
    nodePolyfills(),
    svgr(),
    resolve({
      extensions: ['.tsx', '.ts', '.jsx', '.js'],
      preferBuiltins: false,
    }),
    babel({
      extensions: ['.tsx', '.ts', '.jsx', '.js'],
      exclude: 'node_modules/**',
      presets: ['@babel/preset-react'],
    }),
    commonjs(),
    nodeResolve({ browser: false }),
    peerDepsExternal(),
    image(),
    json(),
    terser(),
    copy({
      targets: [{ src: 'src/assets', dest: 'dist' }],
    }),
  ],
};
