import _ from 'lodash'
import fs from 'fs-extra'
import path from 'path'
import glob from 'glob'
import yaml from 'js-yaml'
import handlebars from 'handlebars'
import chokidar from 'chokidar'
import { fileURLToPath } from 'url'
import { convertMarkdownToHtml } from './markdown.js'
import { createHbsViewEngine } from './hbs-express.js'
import { getTargetFilename, isYamlConfig } from './utils.js'

function readTemplates(dir) {
    const extName = '.hbs'
    const files = glob.sync(`${dir}/**/*${extName}`)
    const cache = {}
    _.each(files, f => {
        let rf = path.relative(dir, f)
        rf = rf.replace(/\\/g, '/')
        let key = rf.substring(0, rf.length - extName.length)
        let source = fs.readFileSync(f).toString()
        let template = handlebars.compile(source)
        cache[key] = { source, template }
    })
    return cache
}

async function syncComponents() {
    const X_COMP = /x-component\s*=\s*['\"](?<component>[^'\"]*)['\"]/g

    console.log('sync components')
    const compTargetDir = path.join(targetDir, 'components')
    try {
        await fs.emptyDir(compTargetDir)
        await fs.copy(compDir, compTargetDir)
    } catch (ex) {
        console.error(ex)
    }
    compToFile = {}
    compFileContents = {}
    const compFiles = glob.sync(`${compDir}/**/*.html`)
    for (let i = 0; i < compFiles.length; i++) {
        let fcomp = compFiles[i]
        let def = fs.readFileSync(fcomp)
        compFileContents[fcomp] = def
        let match
        while ((match = X_COMP.exec(def)) !== null) {
            let compName = _.trim(match.groups.component)
            compToFile[compName] = fcomp
        }
    }
}
async function syncAssets() {
    console.log('sync assets')
    try {
        const assetsTargetDir = path.join(targetDir, 'assets')
        await fs.emptyDir(assetsTargetDir)
        await fs.copy(assetsDir, assetsTargetDir)
    } catch (ex) {
        console.error(ex)
    }
}
async function convertMarkdownFile(fin, siteData) {
    siteDataCache[fin] = siteData
    let frel = path.relative(sourceDir, fin)
    let fout = path.join(targetDir, getTargetFilename(frel))
    console.log(`> ${frel}`)
    let content = fs.readFileSync(fin).toString()
    let result = await convertMarkdownToHtml(content, compToFile)
    let compsImportContent = _.map(result.imports, f => compFileContents[f]).join('\n')
    render(result.html, { site: siteData, page: result.page, imports: compsImportContent }, (err, html) => {
        if (err)
            console.error(`fails to convert ${fin}`, err)
        else {
            fs.ensureFileSync(fout)
            fs.writeFileSync(fout, html)
        }
    })
}
async function convertFolder(folder, siteData) {
    siteDataCache[folder] = siteData
    let files = fs.readdirSync(folder)
    let markdownFiles = []
    let subFolders = []
    let i
    for (i = 0; i < files.length; i++) {
        let f = path.join(folder, files[i])
        if (fs.statSync(f).isDirectory()) {
            if (!f.startsWith('.'))
                subFolders.push(f)
        } else {
            let ext = path.extname(f)
            if (ext === '.md') {
                markdownFiles.push(f)
            } else if (isYamlConfig(f)) {
                try {
                    let data = yaml.load(fs.readFileSync(f).toString())
                    siteData = { ...siteData, ...data }
                } catch (ex) {
                    console.error(`fails to load config yaml "${f}"`, ex)
                }
            }
        }
    }
    for (i = 0; i < markdownFiles.length; i++) {
        await convertMarkdownFile(markdownFiles[i], siteData)
    }
    for (i = 0; i < subFolders.length; i++) {
        await convertFolder(subFolders[i], siteData)
    }
}
function watchDir(dir, callback) {
    const watcher = chokidar.watch(dir, { ignoreInitial: true })
    _.each(['add', 'addDir', 'change', 'unlink', 'unlinkDir'], event => watcher.on(event, callback))
}
async function build() {

    await fs.emptyDir(targetDir)
    await syncAssets()
    await syncComponents()

    render = await createHbsViewEngine({
        pretty: true,
        defaultLayout: 'default',
        layouts: readTemplates(layoutsDir),
        partials: readTemplates(partialsDir)
    })
    siteDataCache = {}
    await convertFolder(sourceDir, {})
}
const action = process.argv[2] || 'build'
const dir = process.argv[3] || '.'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const root = process.cwd()
const targetDir = path.join(root, '.vidoc')
const sourceDir = path.join(root, dir)
const tplDir = path.join(__dirname, 'template')
const compDir = path.join(tplDir, 'components')
const assetsDir = path.join(tplDir, 'assets')
const layoutsDir = path.join(tplDir, 'layouts')
const partialsDir = path.join(tplDir, 'partials')
let compToFile = {}
let compFileContents = {}
let render
let siteDataCache = {}
let info = JSON.parse(fs.readFileSync(`${__dirname}/package.json`).toString())

console.log(`${info.name} ${info.version} ${action} ${dir}`)
build()

if (action === 'watch') {
    watchDir([compDir, layoutsDir, partialsDir], () => { build() })
    watchDir(assetsDir, () => { syncAssets() })

    const watcher = chokidar.watch(sourceDir, { ignoreInitial: true })

    _.each(['add', 'change'], event => watcher.on(event, fin => {
        if (fin.endsWith('.md'))
            convertMarkdownFile(fin, siteDataCache[fin])
        else if (isYamlConfig(fin)) {
            let dir = path.dirname(fin)
            convertFolder(dir, siteDataCache[dir])
        }
        else
            build()
    }))

    _.each(['unlink', 'unlinkDir'], event => watcher.on(event, f => {
        let frel = path.relative(sourceDir, f)
        let ft = path.join(targetDir, frel)
        try {
            if (isYamlConfig(f)) {
                let dir = path.dirname(f)
                convertFolder(dir, siteDataCache[dir])
            } else if (fs.existsSync(ft)) {
                fs.removeSync(ft)
            } else {
                if (ft.endsWith('.md')) {
                    fs.removeSync(getTargetFilename(ft))
                }
            }
        } catch (ex) {
            console.error(ex)
        }
    }))
    process.stdin.resume();
    process.on('SIGINT', function () {
        console.log('exit!');
        process.exit();
    })
}