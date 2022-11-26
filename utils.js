import path from 'path'
export function getTargetFilename(fn) {
    const README = 'README.md'
    const EXT = '.md'
    if (fn) {
        if (fn === README || fn.endsWith(`/${README}`)) {
            return fn.substring(0, fn.length - README.length) + 'index.html'
        } else if (fn.endsWith(EXT)) {
            return fn.substring(0, fn.length - EXT.length) + '.html'
        }
    }
    return fn
}
export function isYamlConfig(fn) {
    fn = path.basename(fn)
    return fn === 'index.yml' || fn === 'index.yaml'
}