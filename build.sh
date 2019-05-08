#!/usr/bin/env bash

rm -rf build
mkdir build

npm run prebuild
NODE_ENV=production rollup -c rollup.config.js
cp package.json build/