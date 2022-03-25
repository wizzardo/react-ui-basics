#!/usr/bin/env bash

npm run prebuild
NODE_ENV=publish rollup -c rollup.config.js
cp package.json build/
cp src/react-ui-basics/*.css build/

cp build/_virtual/_rollupPluginBabelHelpers.js ./
cp -R build/src/react-ui-basics/* build/
rm -rf build/src
rm -rf build/node_modules

if ! md5sum -c helpers.md5; then
    echo 'helpers updated, please check the changes'
    exit 1
fi

cp helpers.js build/_virtual/_rollupPluginBabelHelpers.js
# md5sum build/_virtual/_rollupPluginBabelHelpers.js > helpers.md5

node replace.js
node replaceAccessors.js