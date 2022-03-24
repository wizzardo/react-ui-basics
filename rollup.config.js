import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import cleanup from 'rollup-plugin-cleanup';
import replace from 'rollup-plugin-replace';
import babel from 'rollup-plugin-babel';
import json from 'rollup-plugin-json';
import scss from 'rollup-plugin-scss';
import typescript from '@rollup/plugin-typescript';
import pkg from './package.json';

const env = process.env.NODE_ENV || 'production';
// const env = 'development';
const isProd = env === 'production';
const isDev = !isProd;


const deps = Object.keys(pkg.dependencies || {});
const peerDeps = Object.keys(pkg.peerDependencies || {});
const defaultExternal = peerDeps;

export default {
    input: 'src/react-ui-basics/index.js',
    output: [
        // {
        //     file: pkg.browser,
        //     name: pkg.name,
        //     format: 'umd',
        //     sourcemap: isProd,
        // },
        // {
        //     file: pkg.main,
        //     name: pkg.name,
        //     format: 'cjs',
        //     sourcemap: isProd,
        // },
        {
            // file: pkg.module,
            dir: 'build',
            format: 'es',
            sourcemap: true,
        },

    ],
    external: defaultExternal,
    // globals: {
    //     react: 'React',
    //     'react-dom': 'ReactDOM'
    // },
    preserveModules: true,
    treeshake: true,
    inlineDynamicImports: false, // true = disabling code splitting to chunks
    // experimentalOptimizeChunks: true,
    // chunkGroupingSize: 10240,
    perf: false,
    watch: {
        chokidar: true,
        include: 'src/**',
        exclude: ['node_modules/**'],
    },
    plugins: [
        scss({
            output: `build/bundle.css`,
        }),
        resolve({
            browser: true,
        }),
        json(),
        commonjs({
            include: [
                'node_modules/**',
            ],
            exclude: [
                'node_modules/process-es6/**',
            ],
            namedExports: {
                'node_modules/react/index.js': ['Children', 'Component', 'PropTypes', 'createElement', 'PureComponent'],
                'node_modules/react-dom/index.js': ['render'],
                'node_modules/react/jsx-runtime.js': ['jsxs', 'jsx'],
                'node_modules/tslib/tslib.es6.js': ['__spreadArray', '__extends','__assign'],
            },
        }),
        babel({
            exclude: 'node_modules/**',
            babelrc: false,
            presets: [
                ["@babel/env", {"modules": false}],
                ["@babel/react", {"pragma": "ReactCreateElement"}],
            ],
            plugins: [
                "@babel/external-helpers",
                // Stage 0
                "@babel/plugin-proposal-function-bind",

                // Stage 1
                "@babel/plugin-proposal-export-default-from",
                "@babel/plugin-proposal-logical-assignment-operators",
                ["@babel/plugin-proposal-optional-chaining", {"loose": true}],
                ["@babel/plugin-proposal-pipeline-operator", {"proposal": "minimal"}],
                ["@babel/plugin-proposal-nullish-coalescing-operator", {"loose": true}],
                "@babel/plugin-proposal-do-expressions",

                ["@babel/plugin-proposal-private-methods", {"loose": true}],
                ["@babel/plugin-proposal-private-property-in-object", {"loose": true}],
                ["@babel/plugin-proposal-class-properties", {"loose": true}],
                "@babel/plugin-syntax-dynamic-import",

                // "transform-react-remove-prop-types",
            ],
        }),
        typescript(),
        // (isProd && uglify()),
        replace({
            'process.env.NODE_ENV': JSON.stringify(env),
        }),
        cleanup(),
    ],
};