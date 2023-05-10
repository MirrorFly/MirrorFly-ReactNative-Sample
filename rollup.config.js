import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import svgr from '@svgr/rollup'
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import json from '@rollup/plugin-json';
import { terser } from "rollup-plugin-terser";

export default {
    input: 'src/index.js',
    output: [
        {
            format: "cjs",
            dir: 'dist/cjs',
            sourcemap: true,
        },
        {
            dir: 'dist',
            format: "esm",
            sourcemap: true,
        }
    ],
    external: [
        'react',
        'react-native',
    ],
    plugins: [
        nodePolyfills(),
        svgr(),
        babel({
            extensions: ['.tsx', '.ts', '.jsx', '.js'],
            exclude: 'node_modules/**',
            presets: ['@babel/preset-react'],
        }),
        peerDepsExternal(),
        resolve({
            extensions: ['.js', '.jsx'],
            preferBuiltins: false
        }),
        commonjs(),
        json(),
        terser(),
    ],
};
