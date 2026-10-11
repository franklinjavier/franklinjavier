import { fileURLToPath } from 'node:url'
import type { HastPluginDefinition } from 'satteri'
import { placeholderName, renderFigure, type Lang } from './index'

// Sätteri hast plugin: replaces `<figure data-diagram="…"></figure>`
// placeholders with the inline SVG figure. The language comes from the file
// path, matching the content layout (src/content/blog/pt-br/… is PT-BR).
function langOf(fileURL: URL | undefined): Lang {
  const path = fileURL ? fileURLToPath(fileURL) : ''
  return /[\\/]pt-br[\\/]/.test(path) ? 'pt-br' : 'en'
}

export const diagramsPlugin: HastPluginDefinition = {
  name: 'inline-diagrams',
  raw(node, ctx) {
    const name = placeholderName(node.value)
    if (name) ctx.replaceNode(node, { type: 'raw', value: renderFigure(name, langOf(ctx.fileURL)) })
  },
  element: {
    filter: ['figure'],
    visit(node, ctx) {
      const name = node.properties?.dataDiagram
      if (typeof name === 'string' && node.children.length === 0) {
        ctx.replaceNode(node, { type: 'raw', value: renderFigure(name, langOf(ctx.fileURL)) })
      }
    },
  },
}
