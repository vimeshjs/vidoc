import _ from 'lodash'
import fs from 'fs-extra'
import path from 'path'
import glob from 'glob'
import handlebars from 'handlebars'
import { setupLogger } from '@vimesh/logger'
import { convertMarkdownToHtml } from './markdown.js'
import { createMemoryCache } from '@vimesh/cache'
import { createHbsViewEngine } from './hbs-express.js'

const X_COMP = /x-component\s*=\s*['\"](?<component>[^'\"]*)['\"]/g

function createLocalTemplateCache(dir) {
    const extName = '.hbs'
    return createMemoryCache({
        onEnumerate: async () => {
            const files = glob.sync(`${dir}/**/*${extName}`)
            return _.map(files, f => {
                let rf = path.relative(dir, f)
                rf = rf.replace(/\\/g, '/')
                return rf.substring(0, rf.length - extName.length)
            })
        },
        onRefresh: async (key) => {
            let fn = `${dir}/${key}${extName}`
            let source = fs.readFileSync(fn).toString()
            let template = handlebars.compile(source)
            return { source, template }
        }
    })
}

async function build(sourceDir, targetDir, tplDir) {
    const compDir = path.join(tplDir, 'components')
    await fs.emptyDir(targetDir)
    await fs.copy(path.join(tplDir, 'assets'), path.join(targetDir, 'assets'))
    await fs.copy(compDir, path.join(targetDir, 'components'))

    let layoutsDir = path.join(tplDir, 'layouts')
    let partialsDir = path.join(tplDir, 'partials')
    let debug = true
    let config = {
        pretty: debug,
        defaultLayout: 'default',
        layouts: await createLocalTemplateCache(layoutsDir).enumerate(),
        partials: await createLocalTemplateCache(partialsDir).enumerate()
    }

    const render = await createHbsViewEngine(config)
    const compToFile = {}
    const compFileContents = {}
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

    const inputs = glob.sync(`${sourceDir}/**/*.md`)
    for (let i = 0; i < inputs.length; i++) {
        let fin = inputs[i]
        let fRelIn = path.relative(sourceDir, fin)
        let fn = fRelIn.substring(0, fRelIn.length - 3)
        if (fn === 'README') fn = 'index'
        let fRelOut = `${fn}.html`
        let fout = path.join(targetDir, fRelOut)
        console.log(`Processing ${fRelIn} -> ${fout}, ${fn}`)
        let content = fs.readFileSync(fin).toString()
        let result = await convertMarkdownToHtml(content, compToFile)
        let compsImportContent = _.map(result.imports, f => compFileContents[f]).join('\n')
        render(result.html, { page: result.page, imports: compsImportContent }, (err, html) => {
            if (err) console.log(err)
            //console.log(html)
            fs.ensureFileSync(fout)
            fs.writeFileSync(fout, html)
        })
    }
}

const root = process.cwd()
const targetDir = path.join(root, '.vidoc')
const sourceDir = path.join(root, 'mnt/vimesh-style')
const tplDir = path.join(process.cwd(), 'template')
setupLogger({ console: {} })
build(sourceDir, targetDir, tplDir)