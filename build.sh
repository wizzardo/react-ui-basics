#!/usr/bin/env bash

npm run prebuild
NODE_ENV=publish rollup -c rollup.config.js
cp package.json build/
cp src/react-ui-basics/*.css build/

cp -R build/src/react-ui-basics/* build/
rm -rf build/src/*
cp -R src/react-ui-basics/* build/src
rm -rf build/node_modules

if ! md5sum -c helpers.md5; then
    echo 'helpers updated, please check the changes'
    exit 1
fi

cp build/_virtual/_rollupPluginBabelHelpers.js ./

cp helpers.js build/_virtual/_rollupPluginBabelHelpers.js
# md5sum build/_virtual/_rollupPluginBabelHelpers.js > helpers.md5

node replace.js
node replaceAccessors.js
node replaceReactNames.js