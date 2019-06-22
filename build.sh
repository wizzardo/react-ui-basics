#!/usr/bin/env bash

rm -rf build
mkdir build

npm run prebuild
NODE_ENV=publish rollup -c rollup.config.js
cp package.json build/
cp src/react-ui-basics/*.css build/