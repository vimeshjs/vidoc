function injectBlocks(params, context) {
    return (context._blocks[params.name] || []).join('\n')
}

export function block(name, options) {
    if (!options.data.root._blocks) options.data.root._blocks = {}
    if (!options.data.root._blocks[name]) options.data.root._blocks[name] = []
    let placeholder = `<!-- *****BLOCK ${name}***** -->`
    options.data.root._postProcessors.push({
        order: 10,
        placeholder,
        params: { name },
        processor: injectBlocks
    })
    return placeholder
}

function appendContentToBlock(name, options, content) {
    if (!options.data.root._blocks) options.data.root._blocks = {}
    if (!options.data.root._blocks[name]) options.data.root._blocks[name] = []
    options.data.root._blocks[name].push(content)
}

export function contentFor(name, options) {
    if (!name) {
        console.error('Block name must be provided in contentFor helper!')
        return
    }
    let content = options.fn(this)
    appendContentToBlock(name, options, content)
}

export function json(js) {
    const safeString = () => js == null ? "null" : js
    return {
        toString: safeString,
        toHTML: safeString
    }
}
