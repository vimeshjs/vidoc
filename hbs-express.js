
import _ from 'lodash'
import Promise from 'bluebird'
import fs from 'fs'
import beautify from 'js-beautify'
import minify from 'html-minifier'
import handlebars from 'handlebars'
import * as allHelpers from './hbs-helpers.js'

const LAYOUT_PATTERN = /{{!<\s+([@A-Za-z0-9\._\-\/]+)\s*}}/
function HbsViewEngine(config) {
    this.extName = config.extName || '.hbs'
    this.defaultLayout = config.defaultLayout
    this.layouts = config.layouts
    this.partials = config.partials
    this.pretty = config.pretty
    this.htmlMinify = config.htmlMinify
}
function extractLayout(view) {
    let matches = view.source.match(LAYOUT_PATTERN);
    return matches ? matches[1] : null
}
function renderWithLayout(context) {
    let layoutName = extractLayout(context.view) || context.layout
    let options = { partials: context.partials, helpers: context.helpers }
    let body = context.view.template(context.locals, options)
    if (layoutName) {
        let layoutView = context.layouts[layoutName]
        if (layoutView) {
            context.locals.body = body
            context.view = layoutView
            context.layout = null
            return renderWithLayout(context)
        } else {
            console.error(`Could not found layout "${layoutName}"`)
        }
    }
    return Promise.resolve(body)
}
HbsViewEngine.prototype.render = function (source, context, callback) {
    let view = {
        source,
        template: handlebars.compile(source, {})
    }
    context = { _postProcessors: [], ...context }
    renderWithLayout({
        layouts: this.layouts,
        partials: this.partials,
        helpers: allHelpers,
        layout: context.layout || this.defaultLayout,
        locals: context,
        view: view
    }).then(html => {
        let sortedProcessors = _.sortBy(context._postProcessors, p => p.order)
        return Promise.each(sortedProcessors, p => {
            let result = p.processor(p.params || {}, context, html)
            if (result.then)
                return result.then(r => {
                    if (_.isString(r)) {
                        html = html.replace(p.placeholder, r)
                    } else if (_.isArray(r)) {
                        _.each(r, item => {
                            html = html.replace(item.placeholder, item.content)
                        })
                    }
                }
                ).catch(ex =>
                    console.error(ex)
                )
            else {
                let r = result
                if (_.isString(r)) {
                    html = html.replace(p.placeholder, r)
                } else if (_.isArray(r)) {
                    _.each(r, item => {
                        html = html.replace(item.placeholder, item.content)
                    })
                }
            }
        }).then(r => html)
    }).then(html => {
        if (this.pretty) {
            html = beautify.html(html)
        } else {
            if (this.htmlMinify) {
                html = minify.minify(html, {
                    minifyCSS: true,
                    minifyJS: true,
                    collapseWhitespace: true,
                    processScripts: [
                        'text/javascript',
                        'text/ecmascript',
                        'text/jscript',
                        'application/javascript',
                        'application/x-javascript',
                        'application/ecmascript'
                    ]
                })
            }
        }
        callback(null, html)
    }).catch(ex => {
        callback(ex)
    })
}

export function createHbsViewEngine(config) {
    let hve = new HbsViewEngine(config)
    return _.bind(hve.render, hve)
}