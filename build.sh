#!/usr/bin/env bash

rm -rf build
mkdir build

npm run prebuild
NODE_ENV=publish rollup -c rollup.config.js
cp package.json build/
cp src/react-ui-basics/*.css build/

if ! md5sum -c helpers.md5; then
    echo 'helpers updated, please check the changes'
    exit 1
fi

cp helpers.js build/_virtual/_rollupPluginBabelHelpers.js
# md5sum build/_virtual/_rollupPluginBabelHelpers.js > helpers.md5


sed -i "s/window.isNotProductionEnvironment/process.env.NODE_ENV !== 'production'/g" build/*.js
sed -i "s/window.isNotProductionEnvironment/process.env.NODE_ENV !== 'production'/g" build/router/*.js