const fs = require("fs-extra")

if (!fs.existsSync('build'))
    fs.mkdirSync('build');

const ls = (path, cb) => {
    fs.readdir(path, (err, files) => {
        if (err)
            return console.log('Unable to scan directory: ' + err);

        files.forEach(file => {
            let f = path + '/' + file;
            if (fs.lstatSync(f).isDirectory())
                ls(f, cb)
            else {
                cb(f)
            }
        });
    });
}

ls('build', file => {
    if (!file.endsWith('.js'))
        return

    if (file.endsWith('_rollupPluginBabelHelpers.js'))
        return

    // console.log(file);

    let data = fs.readFileSync(file, {encoding: 'utf8', flag: 'r'});
    data = data.replace(`from '../../node_modules/react/jsx-runtime.js'`, `from 'react/jsx-runtime'`)
    data = data.replace(`from '../../../_virtual/_rollupPluginBabelHelpers.js';`, `from '../_virtual/_rollupPluginBabelHelpers.js';`)
    data = data.replace(`from '../../_virtual/_rollupPluginBabelHelpers.js';`, `from './_virtual/_rollupPluginBabelHelpers.js';`)
    data = data.replaceAll(`window.isNotProductionEnvironment`, `process.env.NODE_ENV !== 'production'`)
    data = data.replaceAll(`window['isNotProductionEnvironment']`, `process.env.NODE_ENV !== 'production'`)


    if (file.endsWith('ReactConstants.js')) {
        fs.writeFileSync(file, data, {encoding: "utf8",})
        return
    }

    data = data.replace(/import \{[ __a-zA-Z,]+\} from 'tslib';/, ``)

    let parts = file.split('/');
    data = data.replace(`;\nimport`, `;\nimport {children as __children} from "${parts.length === 3 ? './.' : ''}./ReactConstants";\nimport`)
    data = data.replaceAll(`children:`, `[__children]:`)
    data = data.replaceAll(/\.children\b/g, `[__children]`)

    data = data.replace(`;\nimport`, `;\nimport {className as __className} from "${parts.length === 3 ? './.' : ''}./ReactConstants";\nimport`)
    data = data.replaceAll(`className:`, `[__className]:`)
    data = data.replaceAll(/\.className\b/g, `[__className]`)

    data = data.replace(`;\nimport`, `;\nimport {inherits as __inherits} from "${parts.length === 3 ? './.' : ''}./_virtual/_rollupPluginBabelHelpers";\nimport`)
    data = data.replaceAll(`__extends`, `__inherits`)

    data = data.replace(`;\nimport`, `;\nimport {extends as __extends} from "${parts.length === 3 ? './.' : ''}./_virtual/_rollupPluginBabelHelpers";\nimport`)
    data = data.replaceAll(`Object.assign`, `__extends`)
    data = data.replaceAll(`__assign`, `__extends`)

    data = data.replace(`;\nimport`, `;\nimport {toConsumableArray as __toConsumableArray} from "${parts.length === 3 ? './.' : ''}./_virtual/_rollupPluginBabelHelpers";\nimport`)
    data = data.replaceAll(`__spreadArray([], `, `__toConsumableArray(`)

    data = data.replace(/[a-zA-Z]+\.prototype\.[a-zA-Z]+\s+=\s+function\s*\([a-zA-Z0-9\s,_]*\)\s*\{\s+return undefined;\s*\};/m, ``)

    fs.writeFileSync(file, data, {encoding: "utf8",})
})