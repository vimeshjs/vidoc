import _ from 'lodash'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import remarkFrontmatter from 'remark-frontmatter'
import remarkDirective from 'remark-directive'
import remarkToc from 'remark-toc'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeHighlight from 'rehype-highlight'
import { visit } from 'unist-util-visit'
import { h } from 'hastscript'
import yaml from 'js-yaml'
import url from 'url'

export async function convertMarkdownToHtml(markdownContent, components) {
    let pageData = null
    let imports = []
    let html = String(await unified()
        .use(remarkParse)
        .use(remarkToc)
        .use(remarkFrontmatter)
        .use(remarkDirective)
        .use(() => (tree) => {
            //console.log(JSON.stringify(tree, null, 2))
            _.each(tree.children, c => {
                if (c.type === 'yaml') {
                    try {
                        pageData = yaml.load(c.value)
                    } catch (ex) {
                        $logger.error(`Fails to parse frontmatter yaml "${c.value}"`, ex)
                    }
                }
            })
            visit(tree, (node) => {
                if (
                    node.type === 'textDirective' ||
                    node.type === 'leafDirective' ||
                    node.type === 'containerDirective'
                ) {
                    let tagName = node.name
                    if (components[tagName]) {
                        if (imports.indexOf(components[tagName]) === -1)
                            imports.push(components[tagName])
                        tagName = `vui-${tagName}`
                    }
                    const data = node.data || (node.data = {})
                    const hast = h(tagName, node.attributes)
                    data.hName = hast.tagName
                    data.hProperties = hast.properties
                } else if (node.type === 'element') {
                    //console.log(node)
                }
            })
        })
        .use(remarkRehype)
        .use(rehypeSlug)
        .use(rehypeAutolinkHeadings)
        .use(() => (tree) => {
            visit(tree, 'element', (node) => {
                processUrl(node, 'href')
                processUrl(node, 'src')
            })
        })
        //.use(rehypeSanitize)
        .use(rehypeHighlight)
        .use(rehypeStringify)
        .process(markdownContent)
    )
    return { html, page: pageData, imports }
}
function processUrl(node, prop) {
    const README = 'README.md'
    const EXT = '.md'
    if (!node.properties[prop]) return
    var obj = url.parse(node.properties[prop])
    if (obj.host) {
        node.properties.target = '_blank'
    }
    let pn = obj.pathname
    if (pn){
        if (pn === README || pn.endsWith(README)) {
            obj.pathname = pn.substring(0, pn.length - README.length) + 'index.html'
        } else if (pn.endsWith(EXT)) {
            obj.pathname = pn.substring(0, pn.length - EXT.length) + '.html'
        }
        node.properties[prop] = url.format(obj)
    }
}