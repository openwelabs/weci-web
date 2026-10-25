import MarkdownIt from 'markdown-it'
import fs from 'node:fs'

/* 复制自 src/lib/markdown.js 的 renderWithAnchors 逻辑（去掉 Vite 专属的 import.meta.glob） */
const md = new MarkdownIt({ html: true, linkify: true })

const defaultLinkOpen =
  md.renderer.rules.link_open ||
  ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options))

md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const href = tokens[idx].attrGet('href') || ''
  if (/^https?:\/\//i.test(href)) {
    tokens[idx].attrSet('target', '_blank')
    tokens[idx].attrSet('rel', 'noopener noreferrer')
  }
  return defaultLinkOpen(tokens, idx, options, env, self)
}

md.renderer.rules.fence = (tokens, idx) => {
  const token = tokens[idx]
  const lang = (token.info || '').trim().split(/\s+/)[0] || 'text'
  const code = md.utils.escapeHtml(token.content)
  return (
    `<div class="code-block" data-lang="${md.utils.escapeHtml(lang)}">` +
    `<div class="code-block__bar"><span class="code-block__lang">${md.utils.escapeHtml(lang)}</span>` +
    `<button class="code-block__copy" type="button" data-copy>复制</button></div>` +
    `<pre class="code-block__pre"><code>${code}</code></pre>` +
    `</div>`
  )
}

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

function renderWithAnchors(source) {
  const headings = extractHeadings(source)
  let html = md.render(source)
  let cursor = 0
  html = html.replace(/<h([1-6])>/g, (match, level) => {
    while (cursor < headings.length && String(headings[cursor].level) !== level) {
      cursor += 1
    }
    const heading = headings[cursor]
    if (!heading) return match
    cursor += 1
    return `<h${level} id="${heading.id}">`
  })
  return { html, headings }
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
  const r = renderWithAnchors(src)
  const h2 = (r.html.match(/<h2 id=/g) || []).length
  const h3 = (r.html.match(/<h3 id=/g) || []).length
  const h2All = (r.html.match(/<h2/g) || []).length
  const h3All = (r.html.match(/<h3/g) || []).length
  const toc = r.headings.filter((h) => h.level === 2 || h.level === 3).length
  const blocks = (r.html.match(/class="code-block"/g) || []).length
  const script = /<script/i.test(r.html)
  const ok = h2 === h2All && h3 === h3All && toc === h2 + h3 && !script
  if (!ok) fail += 1
  console.log(
    `${ok ? 'OK ' : 'BAD'} ${f}\n    h2 ${h2}/${h2All}  h3 ${h3}/${h3All}  toc=${toc}  code-blocks=${blocks}  script=${script}`
  )
}

console.log(fail === 0 ? '\nALL ANCHORS OK' : `\nFAILED: ${fail}`)
