/**
 * 校验 slug 归一化与文档解析（不依赖 Vite 运行时）
 * 用 node 直接跑：node scripts/check-slugs.mjs
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = 'src/content'

/* ---- 收集真实存在的文档 ---- */
function walk(dir, base = '') {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${entry.name}` : entry.name
    if (entry.isDirectory()) out.push(...walk(path.join(dir, entry.name), rel))
    else if (entry.name.endsWith('.md')) out.push(rel.replace(/\.md$/, ''))
  }
  return out
}

const AVAILABLE = new Set(walk(ROOT))

/* ---- 复制自 src/lib/markdown.js 的 normalizeSlug ---- */
const DOC_META_KEYS = [
  'docs/weci-readme.zh-CN',
  'docs/weci-readme.en',
  'docs/plugins/README',
  'docs/plugins/quickstart',
  'docs/plugins/manifest',
  'docs/plugins/sdk',
  'docs/plugins/tools',
  'docs/plugins/permissions',
]

function normalizeSlug(input = '') {
  let slug = decodeURIComponent(String(input || ''))
    .trim()
    .replace(/^\/+/, '')
    .replace(/\.md$/i, '')
    .replace(/\/+$/, '')

  if (!slug) return ''
  if (slug.startsWith('docs/')) slug = slug.slice('docs/'.length)
  if (slug === 'plugins') slug = 'plugins/README'

  const withDocs = `docs/${slug}`
  if (DOC_META_KEYS.includes(withDocs)) return withDocs
  if (DOC_META_KEYS.includes(slug)) return slug

  if (slug.toLowerCase() === 'readme') return 'docs/plugins/README'
  if (slug === 'weci-readme') return 'docs/weci-readme.zh-CN'

  return withDocs
}

/* ---- 用例 ---- */
const cases = [
  // [输入, 期望 key]
  ['weci-readme.zh-CN', 'docs/weci-readme.zh-CN'],
  ['weci-readme.en', 'docs/weci-readme.en'],
  ['weci-readme', 'docs/weci-readme.zh-CN'],
  ['docs/weci-readme.zh-CN', 'docs/weci-readme.zh-CN'],
  ['weci-readme.zh-CN.md', 'docs/weci-readme.zh-CN'],
  ['/docs/weci-readme.en/', 'docs/weci-readme.en'],
  ['plugins/sdk', 'docs/plugins/sdk'],
  ['plugins/sdk.md', 'docs/plugins/sdk'],
  ['docs/plugins/sdk', 'docs/plugins/sdk'],
  ['plugins/README', 'docs/plugins/README'],
  ['plugins', 'docs/plugins/README'],
  ['README', 'docs/plugins/README'],
  ['plugins/quickstart', 'docs/plugins/quickstart'],
  ['plugins/manifest', 'docs/plugins/manifest'],
  ['plugins/tools', 'docs/plugins/tools'],
  ['plugins/permissions', 'docs/plugins/permissions'],
]

let fail = 0
for (const [input, expected] of cases) {
  const got = normalizeSlug(input)
  const ok = got === expected
  const exists = AVAILABLE.has(got)
  if (!ok || !exists) fail += 1
  console.log(
    `${ok && exists ? 'OK ' : 'BAD'} ${JSON.stringify(input).padEnd(28)} → ${got.padEnd(
      28
    )} exists=${exists}`
  )
}

/* ---- 每个真实文档都应能被某个路由 slug 命中 ---- */
console.log('\n-- 文档可达性 --')
for (const key of [...AVAILABLE].sort()) {
  const routeSlug = key.replace(/^docs\//, '')
  const back = normalizeSlug(routeSlug)
  const ok = back === key
  if (!ok) fail += 1
  console.log(`${ok ? 'OK ' : 'BAD'} /docs/${routeSlug.padEnd(30)} → ${back}`)
}

/* ---- 插件路由可达性 ---- */
console.log('\n-- 插件页可达性 --')
for (const key of [...AVAILABLE].filter((k) => k.startsWith('docs/plugins/')).sort()) {
  const short = key.replace(/^docs\/plugins\//, '')
  const back = normalizeSlug(`plugins/${short}`)
  const ok = back === key
  if (!ok) fail += 1
  console.log(`${ok ? 'OK ' : 'BAD'} /plugins/${short.padEnd(26)} → ${back}`)
}

console.log(fail === 0 ? '\nALL SLUGS OK' : `\nFAILED: ${fail}`)
process.exit(fail === 0 ? 0 : 1)
