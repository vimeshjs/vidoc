import _ from 'lodash'
import fs from 'fs'
import path from 'path'
import glob from 'glob'
import Promise from 'bluebird'
import handlebars from 'handlebars'
import rimraf from 'rimraf'
import mkdirp from 'mkdirp'
import { setupLogger } from '@vimesh/logger'
import { convertMarkdownToHtml } from './markdown.js'
import { createMemoryCache } from '@vimesh/cache'
import { createHbsViewEngine } from './hbs-express.js'
const readFileAsync = Promise.promisify(fs.readFile)

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
            let source = (await readFileAsync(fn)).toString()
            let template = handlebars.compile(source)
            return { source, template }
        }
    })
}

async function build(sourceDir, targetDir) {

    let tplDir = path.join(process.cwd(), 'template')
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
        let result = await convertMarkdownToHtml(content)

        render(result, {}, (err, html) => {
            if (err) console.log(err)
            //console.log(html)
            fs.writeFileSync(fout, html)
        })
    }
}

const root = process.cwd()
const targetDir = path.join(root, '.vidoc')
const sourceDir = path.join(root, 'mnt/vimesh-style')
setupLogger({ console: {} })
rimraf.sync(targetDir)
mkdirp.sync(targetDir)
build(sourceDir, targetDir)