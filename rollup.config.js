import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import image from '@rollup/plugin-image';
import json from '@rollup/plugin-json';
import resolve, { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import svgr from '@svgr/rollup';
import copy from 'rollup-plugin-copy';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { terser } from 'rollup-plugin-terser';

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
      '@notifee/react-native',
      '@react-native-camera-roll/camera-roll',
      '@react-native-clipboard/clipboard',
      '@react-native-community/checkbox',
      '@react-native-community/netinfo',
      '@react-native-firebase/app',
      '@react-native-firebase/messaging',
      '@react-navigation/native',
      '@react-navigation/native-stack',
      '@reduxjs/toolkit',
      'emoji-datasource',
      'mirrorfly-reactnative-sdk',
      'moment',
      'react-native-camera',
      'react-native-compressor',
      'react-native-contacts',
      'react-native-convert-ph-asset',
      'react-native-create-thumbnail',
      'react-native-document-picker',
      'react-native-file-viewer',
      'react-native-fs',
      'react-native-geocoder',
      'react-native-geolocation-service',
      'react-native-gesture-handler',
      'react-native-get-random-values',
      'react-native-heic-converter',
      'react-native-image-crop-picker',
      'react-native-maps',
      'react-native-pager-view',
      'react-native-permissions',
      'react-native-progress',
      'react-native-safe-area-context',
      'react-native-screens',
      'react-native-sound',
      'react-native-svg',
      'react-native-svg-transformer',
      'react-native-tab-view',
      'react-native-video',
      'react-redux',
      'rn-fetch-blob',
      'realm',
      'react-native-image-zoom-viewer',
      '@react-native-community/checkbox',
      //Calls
      'react-native-incall-manager',
      'react-native-webrtc',
      'react-native-keep-awake',
      'react-native-raw-bottom-sheet',
      'react-native-background-timer',
      'react-native-headphone-detection',
      'react-native-voip-push-notification',
      'react-native-material-menu',
      'react-native-keyevent',
      'react-native-ringer-mode',
   ],
   plugins: [
      replace({
         preventAssignment: true,
         'process.env.NODE_ENV': JSON.stringify('development'),
      }),
      nodePolyfills(),
      svgr(),
      resolve({
         extensions: ['.tsx', '.ts', '.jsx', '.js'],
         preferBuiltins: false,
      }),
      babel({
         extensions: ['.tsx', '.ts', '.jsx', '.js'],
         exclude: 'node_modules/**',
         presets: ['@babel/preset-react', '@babel/preset-typescript'],
         plugins: ['transform-remove-console'],
      }),
      commonjs(),
      terser(),
      nodeResolve({ browser: false }),
      peerDepsExternal(),
      image(),
      json(),
      copy({
         targets: [{ src: 'src/assets', dest: 'dist' }],
      }),
   ],
};
