/**
 * Usage: node gen-docs.js
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'


const __dirname = dirname(fileURLToPath(import.meta.url))

const filePath = resolve(__dirname, 'framework/components.js')
const outputPath = resolve(__dirname, 'components.md')

const source = readFileSync(filePath, 'utf8')

/**
 * Parse a raw JSDoc block into { description, params, returns, typedef }
 */
function parseJsDoc(raw) {
  const lines = raw
    .split('\n')
    .map((l) => l.replace(/^\s*\*\s?/, '').trim())
    .filter(Boolean)

  const descLines = []
  const params = []
  let returns = null
  let typedef = null

  for (const line of lines) {
    if (line.startsWith('@param')) {
      // @param {Type} name - description
      const m = line.match(/@param\s+(\{[^}]*\})?\s*(\[[^\]]*\]|\S+)?\s*[-–]?\s*(.*)/)
      if (m) {
        params.push({
          type: m[1] || '',
          name: m[2] || '',
          description: m[3] || '',
        })
      }
    } else if (line.startsWith('@returns')) {
      const m = line.match(/@returns\s+(\{[^}]*\})?\s*(.*)/)
      returns = { type: m?.[1] || '', description: m?.[2] || '' }
    } else if (line.startsWith('@typedef')) {
      typedef = line.replace('@typedef', '').trim()
    } else if (!line.startsWith('@')) {
      if (params.length === 0 && !returns) {
        descLines.push(line)
      }
    }
  }

  return { description: descLines.join(' '), params, returns, typedef }
}

// Match a single JSDoc block (no nested */ allowed) immediately followed by export const name
const exportPattern = /\/\*\*((?:[^*]|\*(?!\/))*)\*\/\s*export\s+const\s+(\w+)/g

const entries = []
let m
while ((m = exportPattern.exec(source)) !== null) {
  const { description, params, returns } = parseJsDoc(m[1])
  entries.push({ name: m[2], description, params, returns })
}

// Also collect top-level @typedef comments (type imports/definitions)
const typedefPattern = /\/\*\*\s*([\s\S]*?)\*\//g
const typedefs = []
let tm
while ((tm = typedefPattern.exec(source)) !== null) {
  const { typedef } = parseJsDoc(tm[1])
  if (typedef) typedefs.push(typedef)
}

// --- Render Markdown ---

const lines = []
lines.push(`# Components\n\n`)

for (const { name, description, params, returns } of entries) {
  lines.push(`### \`${name}\`\n`)

  if (description) {
    lines.push(`${description}\n`)
  }

  if (params.length) {
    lines.push(`**Parameters:**\n`)
    for (const p of params) {
      const typePart = p.type ? ` ${p.type}` : ''
      const namePart = p.name ? ` \`${p.name}\`` : ''
      const descPart = p.description ? ` — ${p.description}` : ''
      lines.push(`-${typePart}${namePart}${descPart}`)
    }
    lines.push('')
  }
}


if (typedefs.length) {
  lines.push(`\n## Types\n`)
  for (const t of typedefs) {
    lines.push(`- \`${t}\``)
  }
}

writeFileSync(outputPath, lines.join('\n'), 'utf8')

