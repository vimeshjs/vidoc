import _ from 'lodash'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
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
import { getTargetFilename } from './utils.js'

export async function convertMarkdownToHtml(markdownContent, components) {
    let pageData = null
    let imports = []
    let html = String(await unified()
        .use(remarkParse)
        .use(remarkToc)
        .use(remarkFrontmatter)
        .use(remarkDirective)
        .use(() => (tree) => {
            _.each(tree.children, c => {
                if (c.type === 'yaml') {
                    try {
                        pageData = yaml.load(c.value)
                    } catch (ex) {
                        console.error(`fails to parse frontmatter yaml "${c.value}"`, ex)
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
        .use(rehypeHighlight)
        .use(rehypeStringify)
        .process(markdownContent)
    )
    return { html, page: pageData, imports }
}
function processUrl(node, prop) {
    if (!node.properties[prop]) return
    var obj = url.parse(node.properties[prop])
    if (obj.host) {
        node.properties.target = '_blank'
    }
    if (obj.pathname) {
        obj.pathname = getTargetFilename(obj.pathname)
        node.properties[prop] = url.format(obj)
    }
}