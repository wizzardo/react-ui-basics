const fs = require("fs-extra")
const fsPromises = fs.promises;

let data = fs.readFileSync('build/ReactConstants.js', {encoding: 'utf8', flag: 'r'}).trim();
data = data.substring(data.indexOf('ReactConstants =') + 'ReactConstants ='.length).trim()
data = data.substring(1, data.indexOf(']')).trim()
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

        data = `import ReactConstants from "${parts.length === 3 ? './.' : ''}./ReactConstants"; ` + data;
        fields.forEach((it,i) => {
            data = data.replaceAll(new RegExp(`(\\.${it}\\b|\\[${it}\\]|"${it}")`, 'g'), `[ReactConstants[${i}]]`)
            data = data.replaceAll(new RegExp(`\\b${it}:`, 'g'), `[ReactConstants[${i}]]:`)
        })

        fs.writeFileSync(file, data, {encoding: "utf8",})
    })

})()