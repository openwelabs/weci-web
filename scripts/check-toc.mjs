import MarkdownIt from 'markdown-it'
import fs from 'node:fs'
import path from 'node:path'

const md = new MarkdownIt({ html: true, linkify: true })

function slugify(text, used) {
  let base = text
    .toLowerCase()
    .replace(/[\s]+/g, '-')
    .replace(/[^\p{L}\p{N}-]/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  if (!base) base = 'section'
  const count = used.get(base) || 0
  used.set(base, count + 1)
  return count === 0 ? base : `${base}-${count}`
}

function extractHeadings(source) {
  const tokens = md.parse(source, {})
  const headings = []
  const used = new Map()
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i]
    if (token.type !== 'heading_open') continue
    const level = Number(token.tag.slice(1))
    const inline = tokens[i + 1]
    if (!inline || inline.type !== 'inline') continue
    const text = inline.content
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/[*_~]/g, '')
      .trim()
    if (!text) continue
    headings.push({ level, text, id: slugify(text, used) })
  }
  return headings
}

const files = [
  'src/content/docs/weci-readme.zh-CN.md',
  'src/content/docs/weci-readme.en.md',
  'src/content/docs/plugins/README.md',
  'src/content/docs/plugins/quickstart.md',
  'src/content/docs/plugins/manifest.md',
  'src/content/docs/plugins/sdk.md',
  'src/content/docs/plugins/tools.md',
  'src/content/docs/plugins/permissions.md',
]

let fail = 0
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8')
  const headings = extractHeadings(src)
  const ids = headings.map((h) => h.id)
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i)
  const toc = headings.filter((h) => h.level === 2 || h.level === 3)
  const empty = ids.filter((id) => !id)
  console.log(
    `${f}\n  headings=${headings.length} toc=${toc.length} dup=${dup.length} empty=${empty.length}`
  )
  if (dup.length || empty.length) {
    fail += 1
    console.log('  !!', { dup, empty })
  }
  // 打印前 5 个 TOC 供抽查
  console.log('  sample:', toc.slice(0, 5).map((h) => `${h.level}:${h.id}`).join(' | '))
}

console.log(fail === 0 ? '\nALL OK' : `\nFAILED ${fail}`)
