#!/usr/bin/env bash

npm run prebuild
NODE_ENV=publish rollup -c rollup.config.js
cp package.json build/
cp src/react-ui-basics/*.css build/

cp build/_virtual/_rollupPluginBabelHelpers.js ./

if ! md5sum -c helpers.md5; then
    echo 'helpers updated, please check the changes'
    exit 1
fi

cp helpers.js build/_virtual/_rollupPluginBabelHelpers.js
# md5sum build/_virtual/_rollupPluginBabelHelpers.js > helpers.md5


sed -i.bak "s/window.isNotProductionEnvironment/process.env.NODE_ENV !== 'production'/g" build/*.js
sed -i.bak "s/window.isNotProductionEnvironment/process.env.NODE_ENV !== 'production'/g" build/router/*.js
sed -i.bak "s/window\['isNotProductionEnvironment'\]/process.env.NODE_ENV !== 'production'/g" build/*.js
sed -i.bak "s/window\['isNotProductionEnvironment'\]/process.env.NODE_ENV !== 'production'/g" build/router/*.js

rm build/*.bak
rm build/router/*.bak