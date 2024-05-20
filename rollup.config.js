import babel from '@rollup/plugin-babel';
import resolve, { nodeResolve } from '@rollup/plugin-node-resolve';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import svgr from '@svgr/rollup';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import json from '@rollup/plugin-json';
import image from '@rollup/plugin-image';
import copy from 'rollup-plugin-copy';
import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';
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
      'react-redux',
      'react-native-fs',
      'rn-fetch-blob',
      'realm',
      'native-base',
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
      'emoji-datasource',
      '@react-navigation/native-stack',
      '@react-native-async-storage/async-storage',
      'react-native-mov-to-mp4',
      'react-native-image-crop-picker',
      'react-native-safe-area-context',
      '@react-native-community/netinfo',
      'react-native-permissions',
      '@react-native-clipboard/clipboard',
      '@react-native-firebase/messaging',
      '@react-native-firebase/app',
      '@types/react',
      'react-native-convert-ph-asset',
      'react-native-create-thumbnail',
      'react-native-file-viewer',
      'react-native-get-random-values',
      'react-native-push-notification',
      'react-native-slider',
      'react-native-svg-transformer',
      '@react-native-community/push-notification-ios',
      'react-native-maps',
      'react-native-geolocation-service',
      'react-native-geocoder',
      'react-native-pager-view',
      'react-native-tab-view',
      '@notifee/react-native',
      'fbjs',
      'react-native-contacts',
      'react-native-audio-recorder-player',
      'react-native-progress',
      'react-native-gesture-handler',
      'react-native-geocoding',
      '@react-native-camera-roll/camera-roll',
      '@react-native-community/checkbox',
      //Calls
      "react-native-incall-manager",
      'react-native-webrtc',
      'react-native-keep-awake',
      'react-native-raw-bottom-sheet',
      'react-native-background-timer',
      'react-native-silentmode-detector',
      'react-native-headphone-detection',
      '@notifee/react-native',
      'react-native-voip-push-notification',
      'mirrorfly-reactnative-sdk',
      "react-native-material-menu",
      "react-native-keyevent",
      "react-native-ringer-mode",
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
