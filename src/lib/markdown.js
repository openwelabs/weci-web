import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'

/* ------------------------------------------------------------------ *
 * Markdown 渲染：markdown-it + DOMPurify
 * 所有 Markdown 内容都来自仓库内的 md 文件，但仍然统一清洗一遍。
 * ------------------------------------------------------------------ */

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: false,
  breaks: false,
})

// 外链统一加 target / rel
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

// 代码块：包一层带语言标签的容器，方便样式与复制按钮
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

export function renderMarkdown(source = '') {
  const raw = md.render(source)
  return DOMPurify.sanitize(raw, {
    ADD_ATTR: ['target', 'rel', 'data-lang', 'data-copy'],
  })
}

/* ------------------------------------------------------------------ *
 * 标题提取：用于生成右侧/左侧目录（TOC）
 * 返回 [{ level, text, id }]
 * ------------------------------------------------------------------ */
export function extractHeadings(source = '') {
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

    const id = slugify(text, used)
    headings.push({ level, text, id })
  }
  return headings
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

/* ------------------------------------------------------------------ *
 * 给渲染后的 HTML 中的标题补上 id，让 TOC 锚点能跳转
 * ------------------------------------------------------------------ */
export function renderWithAnchors(source = '') {
  const headings = extractHeadings(source)
  let html = renderMarkdown(source)

  let cursor = 0
  html = html.replace(/<h([1-6])>/g, (match, level) => {
    // 只给 h2/h3 生成锚点，与 TOC 一致
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

/* ================================================================== *
 * 文档内容加载
 * ================================================================== */

const rawDocs = import.meta.glob('../content/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const SOURCE_PREFIX = '../content/'

/** 从 glob 结果中取出「去掉扩展名」的 slug，例如 'docs/plugins/sdk' */
const AVAILABLE = new Set(
  Object.keys(rawDocs).map((key) => key.slice(SOURCE_PREFIX.length).replace(/\.md$/, ''))
)

/* ------------------------------------------------------------------ *
 * 文档元数据
 * slug 统一使用「相对 src/content 的路径，去掉 .md」，
 * 例如 'docs/plugins/sdk'、'docs/weci-readme.zh-CN'
 * ------------------------------------------------------------------ */

const DOC_META = {
  'docs/weci-readme.zh-CN': {
    title: 'WeCi 使用手册',
    titleEn: 'WeCi Handbook',
    group: 'overview',
    lang: 'zh-CN',
    description: '功能、安装、配置与架构的完整说明。',
    descriptionEn: 'Features, installation, configuration and architecture.',
    /** 同一篇文档的其他语言版本 */
    alternate: 'docs/weci-readme.en',
  },
  'docs/weci-readme.en': {
    title: 'WeCi Handbook (EN)',
    titleEn: 'WeCi Handbook (EN)',
    group: 'overview',
    lang: 'en',
    description: 'English version of the WeCi handbook.',
    descriptionEn: 'English version of the WeCi handbook.',
    alternate: 'docs/weci-readme.zh-CN',
  },
  'docs/plugins/README': {
    title: '插件开发总览',
    titleEn: 'Plugin development overview',
    group: 'plugins',
    lang: 'zh-CN',
    description: 'WeCi Plugin SDK v0.1 文档索引与核心概念。',
    descriptionEn: 'Index and core concepts for WeCi Plugin SDK v0.1.',
  },
  'docs/plugins/quickstart': {
    title: '快速上手',
    titleEn: 'Quickstart',
    group: 'plugins',
    lang: 'zh-CN',
    description: '5 分钟：创建 → 写工具 → 打包安装。',
    descriptionEn: 'Five minutes: scaffold, write a tool, package, install.',
  },
  'docs/plugins/manifest': {
    title: 'manifest.json',
    titleEn: 'manifest.json',
    group: 'plugins',
    lang: 'zh-CN',
    description: '清单字段规范与校验规则。',
    descriptionEn: 'Manifest fields and validation rules.',
  },
  'docs/plugins/sdk': {
    title: 'SDK API',
    titleEn: 'SDK API',
    group: 'plugins',
    lang: 'zh-CN',
    description: 'WeCiPlugin、Tool、ToolResult、PluginContext。',
    descriptionEn: 'WeCiPlugin, Tool, ToolResult, PluginContext.',
  },
  'docs/plugins/tools': {
    title: '工具开发',
    titleEn: 'Writing tools',
    group: 'plugins',
    lang: 'zh-CN',
    description: '参数 schema、执行、返回值与错误处理。',
    descriptionEn: 'Parameter schema, execution, return values, error handling.',
  },
  'docs/plugins/permissions': {
    title: '权限系统',
    titleEn: 'Permissions',
    group: 'plugins',
    lang: 'zh-CN',
    description: '声明、能力、拒绝与安全边界。',
    descriptionEn: 'Declarations, capabilities, denial and security boundaries.',
  },
}

const GROUP_ORDER = ['overview', 'plugins']
const GROUP_LABELS = {
  overview: { 'zh-CN': '概览', en: 'Overview' },
  plugins: { 'zh-CN': '插件开发', en: 'Plugin development' },
}

/* ------------------------------------------------------------------ *
 * 别名表：兼容旧链接与 Markdown 内部相对链接
 * ------------------------------------------------------------------ */

/**
 * 把任意「用户可能输入的 slug」规范化为 DOC_META 的 key。
 * 支持：
 *   weci-readme.zh-CN / weci-readme.en / weci-readme
 *   plugins/sdk / docs/plugins/sdk / plugins/sdk.md / docs/plugins/sdk.md
 *   README / plugins/README / docs/plugins/README
 */
export function normalizeSlug(input = '') {
  let slug = decodeURIComponent(String(input || ''))
    .trim()
    .replace(/^\/+/, '')
    .replace(/\.md$/i, '')
    .replace(/\/+$/, '')

  if (!slug) return ''

  // 去掉可能存在的 docs/ 前缀，统一成「相对 content 根」的短形式
  if (slug.startsWith('docs/')) slug = slug.slice('docs/'.length)

  // plugins 目录下的 README 视为总览
  if (slug === 'plugins') slug = 'plugins/README'

  // 直接命中短形式
  const withDocs = `docs/${slug}`
  if (DOC_META[withDocs]) return withDocs
  if (DOC_META[slug]) return slug

  // 裸 readme 指向插件总览（与仓库 docs/plugins/README.md 的习惯一致）
  if (slug.toLowerCase() === 'readme') return 'docs/plugins/README'

  // 使用手册：weci-readme → 默认中文
  if (slug === 'weci-readme') return 'docs/weci-readme.zh-CN'

  return withDocs
}

/** 判断某个 slug 是否有真实内容 */
export function docExists(slug) {
  const key = normalizeSlug(slug)
  if (!key) return false
  return Boolean(rawDocs[`${SOURCE_PREFIX}${key}.md`])
}

/* ------------------------------------------------------------------ *
 * 对外数据
 * ------------------------------------------------------------------ */

function metaFor(key) {
  const meta = DOC_META[key]
  const fallbackTitle = key.split('/').pop()
  return {
    slug: key,
    /** 路由里使用的短 slug（去掉 docs/ 前缀） */
    routeSlug: key.replace(/^docs\//, ''),
    title: meta?.title || fallbackTitle,
    titleEn: meta?.titleEn || meta?.title || fallbackTitle,
    group: meta?.group || 'overview',
    lang: meta?.lang || 'zh-CN',
    description: meta?.description || '',
    descriptionEn: meta?.descriptionEn || meta?.description || '',
    alternate: meta?.alternate || '',
  }
}

/** 所有「真实存在」的文档，按分组 + 预设顺序排序 */
export const DOC_LIST = (() => {
  const keys = new Set([...Object.keys(DOC_META), ...AVAILABLE])
  return [...keys]
    .filter((key) => AVAILABLE.has(key))
    .map(metaFor)
    .sort((a, b) => {
      const ga = GROUP_ORDER.indexOf(a.group)
      const gb = GROUP_ORDER.indexOf(b.group)
      if (ga !== gb) return ga - gb
      const order = [...Object.keys(DOC_META), ...AVAILABLE]
      return order.indexOf(a.slug) - order.indexOf(b.slug)
    })
})()

/** 分组后的文档，供侧边栏使用 */
export function docGroups(locale = 'zh-CN') {
  const map = new Map()
  for (const doc of DOC_LIST) {
    if (!map.has(doc.group)) map.set(doc.group, [])
    map.get(doc.group).push(doc)
  }
  return [...map.entries()].map(([group, docs]) => ({
    group,
    label: GROUP_LABELS[group]?.[locale] || GROUP_LABELS[group]?.['zh-CN'] || group,
    docs,
  }))
}

/** 取文档原文；不存在返回空字符串 */
export function getDocSource(slug) {
  const key = normalizeSlug(slug)
  if (!key) return ''
  return rawDocs[`${SOURCE_PREFIX}${key}.md`] || ''
}

/** 取文档元数据；不存在返回 null */
export function getDocMeta(slug) {
  const key = normalizeSlug(slug)
  if (!key || !AVAILABLE.has(key)) return null
  return metaFor(key)
}

/** 按语言过滤文档列表（用于语言切换后的导航） */
export function docsByLang(lang) {
  return DOC_LIST.filter((doc) => doc.lang === lang)
}

/**
 * 为「文档不存在」场景提供近似建议（按 slug 片段做简单相似度）
 */
export function suggestDocs(slug, limit = 4) {
  const needle = normalizeSlug(slug).toLowerCase()
  if (!needle) return DOC_LIST.slice(0, limit)
  const parts = needle.split('/').filter(Boolean)

  const scored = DOC_LIST.map((doc) => {
    const hay = `${doc.slug} ${doc.title} ${doc.titleEn}`.toLowerCase()
    let score = 0
    for (const p of parts) {
      if (p && hay.includes(p)) score += 2
    }
    if (hay.includes(needle)) score += 3
    return { doc, score }
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)

  if (!scored.length) return DOC_LIST.slice(0, limit)
  return scored.slice(0, limit).map((item) => item.doc)
}
