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

export async function convertMarkdownToHtml(markdownContent) {
    return String(await unified()
        .use(remarkParse)
        .use(remarkToc)
        .use(remarkFrontmatter)
        .use(remarkDirective)
        .use(() => (tree) => {
            //console.log(JSON.stringify(tree, null, 2))
            visit(tree, (node) => {
                if (
                    node.type === 'textDirective' ||
                    node.type === 'leafDirective' ||
                    node.type === 'containerDirective'
                ) {
                    const data = node.data || (node.data = {})
                    const hast = h(node.name, node.attributes)

                    data.hName = hast.tagName
                    data.hProperties = hast.properties
                }
            })
        })
        .use(remarkRehype)
        .use(rehypeSlug)
        .use(rehypeAutolinkHeadings)
        //.use(rehypeSanitize)
        .use(rehypeHighlight)
        .use(rehypeStringify)
        .process(markdownContent)
    )
}
