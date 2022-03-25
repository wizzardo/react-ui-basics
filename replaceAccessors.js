const fs = require("fs-extra")
const fsPromises = fs.promises;

let data = fs.readFileSync('build/CommonFields.js', {encoding: 'utf8', flag: 'r'}).trim();
data = data.substring(data.indexOf('export') + 6).trim()
data = data.substring(1, data.indexOf('}')).trim()
const fields = data.split(', ')
console.log(fields)

if (!fs.existsSync('build'))
    fs.mkdirSync('build');

const ls = async (path, cb) => {
    try {
        const files = await fsPromises.readdir(path);

        for (const file of files) {
            let f = path + '/' + file;
            if ((await fsPromises.lstat(f)).isDirectory())
                await ls(f, cb)
            else {
                cb(f)
            }
        }
    } catch (e) {
        return console.log('Unable to scan directory: ' + e);
    }
}

(async () => {
    const fieldStats = {}
    await ls('build', file => {
        if (!file.endsWith('.js'))
            return

        if (file.endsWith('_rollupPluginBabelHelpers.js'))
            return

        if (file.endsWith('ReactConstants.js')) {
            return
        }
        if (file.endsWith('CommonFields.js')) {
            return
        }

        let parts = file.split('/');
        let data = fs.readFileSync(file, {encoding: 'utf8', flag: 'r'});
        data = `import {${fields.map(it => `${it} as __${it}`).join(', ')}} from "${parts.length === 3 ? './.' : ''}./CommonFields";\n` + data
        // fields.forEach(it => {
        //     data = data.replaceAll(new RegExp(`\\.${it}\\b`, 'g'), `[__${it}]`)
        // })


        const fieldRegExp = new RegExp(`(\\b[a-zA-Z_0-9$]+(?:\\([a-zA-Z_0-9$]*\\)|\\[[a-zA-Z_0-9$]*\\])?)\\.([a-zA-Z_0-9]+)\\b([\\s*/|+-]*==?)?`, 'dg')
        let find
        while (find = fieldRegExp.exec(data)) {
            if (!fieldStats[find[2]])
                fieldStats[find[2]] = {r: 0, w: 0}

            const ro = !find[3] || find[3].trim() === '=='
            fieldStats[find[2]][ro ? 'r' : 'w']++;

            if (ro && fields.includes(find[2])) {
                data = data.substring(0, find.index) + `__${find[2]}(${find[1]})` + data.substring(find.indices[2][1])
            }
            debugger
        }

        fs.writeFileSync(file, data, {encoding: "utf8",})
    })

    debugger
    Object.keys(fieldStats).sort((a, b) => fieldStats[a].r - fieldStats[b].r).forEach(k => {
        if (k.length <= 3)
            return
        if (k === 'func' || k === 'bool' || k === 'string' || k === 'number' || k === 'element' || k === 'defaultProps' || k === 'oneOfType' || k === 'propTypes' || k === 'NODE_ENV')
            return
        if (!fieldStats[k] || fieldStats[k].r < 5)
            return

        const prefix = fields.includes(k) ? '' : '  '

        console.log(prefix + k, fieldStats[k])
    })
})()