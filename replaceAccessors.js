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

        let parts = file.split('/');
        let data = fs.readFileSync(file, {encoding: 'utf8', flag: 'r'});
        data = data.replace(`;\nimport`, `;\nimport {${fields.map(it => `${it} as __${it}`).join(', ')}} from "${parts.length === 3 ? './.' : ''}./CommonFields";\nimport`)
        fields.forEach(it => {
            data = data.replaceAll(new RegExp(`\\.${it}\\b`, 'g'), `[__${it}]`)
        })

        fs.writeFileSync(file, data, {encoding: "utf8",})

        const fieldRegExp = new RegExp(`\\.([a-zA-Z_0-9]+)\\b`, 'g')
        let find
        while (find = fieldRegExp.exec(data)) {
            if (!fieldStats[find[1]])
                fieldStats[find[1]] = 0
            fieldStats[find[1]]++;
            debugger
        }
    })

    debugger
    Object.keys(fieldStats).sort((a, b) => fieldStats[a] - fieldStats[b]).forEach(k => {
        if (k.length <= 3)
            return
        if (k === 'func' || k === 'bool' || k === 'string' || k === 'number' || k === 'element' || k === 'defaultProps' || k === 'propTypes' || k === 'NODE_ENV')
            return
        if (!fieldStats[k] || fieldStats[k] < 10)
            return

        console.log(k, fieldStats[k])
    })
})()