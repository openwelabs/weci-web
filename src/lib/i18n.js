import { computed, ref } from 'vue'

/* ==================================================================
 * 轻量 i18n：只做「界面文案」的双语切换。
 * 文档正文本身由 Markdown 文件提供（zh-CN / en 两套 md），
 * 这里只管导航、按钮、标题等 UI 字符串。
 * ================================================================== */

export const LOCALES = ['zh-CN', 'en']
export const LOCALE_LABELS = { 'zh-CN': '中文', en: 'EN' }
const STORAGE_KEY = 'weci-web-locale'
const DEFAULT_LOCALE = 'zh-CN'

function detect() {
  if (typeof window === 'undefined') return DEFAULT_LOCALE
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && LOCALES.includes(saved)) return saved
  } catch (e) {
    /* ignore */
  }
  const nav = (navigator.language || '').toLowerCase()
  return nav.startsWith('zh') ? 'zh-CN' : 'en'
}

export const locale = ref(detect())

export function setLocale(next) {
  if (!LOCALES.includes(next)) return
  locale.value = next
  if (typeof document !== 'undefined') {
    document.documentElement.lang = next
  }
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch (e) {
    /* ignore */
  }
}

export function toggleLocale() {
  setLocale(locale.value === 'zh-CN' ? 'en' : 'zh-CN')
}

/** 取当前语言下的一条文案；缺失时回退到 zh-CN，再回退到 key */
function pick(dict, key) {
  const table = dict[locale.value] || dict[DEFAULT_LOCALE] || {}
  if (table[key] != null) return table[key]
  const fallback = dict[DEFAULT_LOCALE] || {}
  return fallback[key] != null ? fallback[key] : key
}

export function useI18n(dict) {
  const t = (key) => pick(dict, key)
  const current = computed(() => locale.value)
  return { t, locale: current, setLocale, toggleLocale }
}

/* ------------------------------------------------------------------
 * 全站通用 UI 文案
 * ------------------------------------------------------------------ */
export const UI = {
  'zh-CN': {
    'nav.home': '首页',
    'nav.docs': '文档',
    'nav.plugins': '插件',
    'nav.community': '插件社区',
    'nav.github': 'GitHub',
    'nav.menu': '切换导航菜单',
    'nav.theme.dark': '切换到亮色主题',
    'nav.theme.light': '切换到暗色主题',
    'nav.lang': '切换语言',

    'footer.tagline':
      '本地优先的 AI 对话客户端 + Agent 工作台。\n无账号，无数据库，数据留在本地。',
    'footer.docs': '文档',
    'footer.plugins': '插件开发',
    'footer.community': '插件社区',
    'footer.maker': 'weci-maker',
    'footer.rights': '开源项目',
    'footer.built': 'Built with Vue 3 + Vite',

    'docs.title': '文档',
    'docs.breadcrumb.home': '首页',
    'docs.breadcrumb.docs': '文档',
    'docs.breadcrumb.plugins': '插件',
    'docs.toc': '本页目录',
    'docs.copy': '复制',
    'docs.copied': '已复制',
    'docs.copyFailed': '复制失败',
    'docs.loading': '加载中…',
    'docs.notFound.title': '文档不存在',
    'docs.notFound.desc': '找不到对应文档：',
    'docs.notFound.back': '返回文档首页',
    'docs.notFound.backPlugins': '返回插件页',
    'docs.notFound.suggest': '你可能想找：',
    'docs.notFound.list': '文档列表',
    'docs.langSwitch': '本文档另有其他语言版本',
    'docs.langSwitchTo': '阅读此文档的英文版',
    'docs.langSwitchToZh': '阅读此文档的中文版',

    'plugins.hero.eyebrow': 'Plugin System',
    'plugins.hero.title': '用插件扩展 WeCi',
    'plugins.hero.lead':
      'Plugin SDK v0.1 · 声明 manifest、实现工具、打包成 .wcp 即可安装。Agent 永远只与 ToolRegistry 交互，新增任意数量插件，Agent Core 零修改。',
    'plugins.hero.quickstart': '5 分钟快速上手',
    'plugins.hero.community': '插件社区',
    'plugins.arch.title': '插件架构',
    'plugins.arch.desc': '加载、注册、调用，三层职责清晰分离。',
    'plugins.docs.title': '开发文档',
    'plugins.docs.desc': '从快速上手到权限边界，覆盖插件开发全流程。',
    'plugins.docs.read': '阅读 →',
    'plugins.community.eyebrow': 'Community',
    'plugins.community.title': '插件社区 · WeCi Plugin Hub',
    'plugins.community.desc':
      '社区驱动的 WeCi 插件集散地：浏览他人发布的插件、下载安装，或用 GitHub 登录发布你自己的作品。支持搜索、投稿指南与中英双语界面。',
    'plugins.community.note': '第三方站点，非 WeCi 官方服务。安装前请自行审查插件源码。',
    'plugins.community.go': '前往插件社区 ↗',
    'plugins.community.submit': '发布我的插件 ↗',
    'plugins.maker.eyebrow': 'Toolchain',
    'plugins.maker.title': 'weci-maker',
    'plugins.maker.desc':
      '官方插件开发工具，定位类似 Cargo。它不重新设计插件架构，而是直接复用 WeCi 本体的 manifest 校验、SDK 与加载器——WeCi 升级校验规则时自动跟随，不会漂移。',
    'plugins.maker.warn':
      '⚠️ 第三方 Python 插件本质上可以执行任意 Python 代码。权限系统是能力控制接口，不是沙箱。不要安装来源不明的插件。',
    'plugins.detail.back': '← 返回插件总览',
    'plugins.detail.source': '源码仓库 ↗',

    'home.hero.badge': '开源 · 本地优先 · OpenAI-compatible',
    'home.hero.title1': '安静地聊天，',
    'home.hero.title2': '或者让 AI ',
    'home.hero.accent': '动手完成',
    'home.hero.title3': '。',
    'home.hero.lead':
      'WeCi 是一个简洁、现代、开源、本地优先的 AI 对话客户端 + Agent 工作台。没有账号、没有数据库，对话历史留在你的浏览器里，模型服务由你自己提供。',
    'home.hero.github': '在 GitHub 上查看',
    'home.hero.docs': '阅读文档',
    'home.features.eyebrow': 'Features',
    'home.features.title': '该有的都有，不该有的都没有',
    'home.features.desc': '没有多余的面板，没有强制的云同步。每个功能都为了解决具体问题。',
    'home.modes.eyebrow': 'Modes',
    'home.modes.title': 'Chat 模式 vs Agent 模式',
    'home.modes.desc': '顶栏一键切换，每个会话会记住自己的模式。',
    'home.install.eyebrow': 'Quick Start',
    'home.install.title': '四条命令跑起来',
    'home.install.desc':
      '需要 Python 3.10+ 和一个 OpenAI-compatible 模型端点。启动后打开 http://127.0.0.1:8000，在设置里填入 Endpoint 与 Model 即可。',
    'home.install.note': 'Key 也可以放在服务端：cp .env.example .env 后填写 WECI_API_KEY，前端留空即可。',
    'home.skills.eyebrow': 'Built-in Skills',
    'home.skills.title': '官方技能，默认开启',
    'home.skills.desc': 'Agent 只与 ToolRegistry 交互，新增插件时 Agent Core 零修改。',
    'home.skills.col.name': '技能',
    'home.skills.col.tools': '工具',
    'home.skills.col.desc': '说明',
    'home.skills.warn':
      '⚠️ Computer 技能让 Agent 能在你的机器上执行命令、修改文件，请在信任 Agent 行为的前提下启用。',
    'home.docs.eyebrow': 'Documentation',
    'home.docs.title': '从这里开始',
    'home.docs.desc': '站点文档直接由仓库里的 Markdown 渲染，与源码保持同步。',
    'home.cta.title': '本地优先，从一次 weci serve 开始',
    'home.cta.desc': '开源、可自托管、不锁定任何模型服务商。',
    'home.cta.github': 'GitHub 仓库',
    'home.cta.plugins': '开发插件',
    'home.cta.community': '插件社区 ↗',

    '404.title': '页面走丢了',
    '404.desc': '你访问的地址不存在，或者文档已经被移动。',
    '404.home': '回到首页',
    '404.docs': '浏览文档',
  },

  en: {
    'nav.home': 'Home',
    'nav.docs': 'Docs',
    'nav.plugins': 'Plugins',
    'nav.community': 'Plugin Hub',
    'nav.github': 'GitHub',
    'nav.menu': 'Toggle navigation',
    'nav.theme.dark': 'Switch to light theme',
    'nav.theme.light': 'Switch to dark theme',
    'nav.lang': 'Switch language',

    'footer.tagline':
      'A local-first AI chat client + Agent workbench.\nNo accounts, no database — your data stays local.',
    'footer.docs': 'Docs',
    'footer.plugins': 'Plugin development',
    'footer.community': 'Plugin Hub',
    'footer.maker': 'weci-maker',
    'footer.rights': 'Open source project',
    'footer.built': 'Built with Vue 3 + Vite',

    'docs.title': 'Documentation',
    'docs.breadcrumb.home': 'Home',
    'docs.breadcrumb.docs': 'Docs',
    'docs.breadcrumb.plugins': 'Plugins',
    'docs.toc': 'On this page',
    'docs.copy': 'Copy',
    'docs.copied': 'Copied',
    'docs.copyFailed': 'Copy failed',
    'docs.loading': 'Loading…',
    'docs.notFound.title': 'Document not found',
    'docs.notFound.desc': 'No document matches:',
    'docs.notFound.back': 'Back to docs',
    'docs.notFound.backPlugins': 'Back to plugins',
    'docs.notFound.suggest': 'You may be looking for:',
    'docs.notFound.list': 'All documents',
    'docs.langSwitch': 'This document is available in another language',
    'docs.langSwitchTo': 'Read this document in English',
    'docs.langSwitchToZh': '阅读此文档的中文版',

    'plugins.hero.eyebrow': 'Plugin System',
    'plugins.hero.title': 'Extend WeCi with plugins',
    'plugins.hero.lead':
      'Plugin SDK v0.1 — declare a manifest, implement tools, package as .wcp and install. The Agent only ever talks to the ToolRegistry, so you can add any number of plugins without touching Agent Core.',
    'plugins.hero.quickstart': '5-minute quickstart',
    'plugins.hero.community': 'Plugin Hub',
    'plugins.arch.title': 'Plugin architecture',
    'plugins.arch.desc': 'Load, register, invoke — three layers with clean responsibilities.',
    'plugins.docs.title': 'Developer docs',
    'plugins.docs.desc': 'From the first plugin to permission boundaries.',
    'plugins.docs.read': 'Read →',
    'plugins.community.eyebrow': 'Community',
    'plugins.community.title': 'Plugin Hub · WeCi community',
    'plugins.community.desc':
      'A community-run home for WeCi plugins: browse and install plugins published by others, or sign in with GitHub to publish your own. Search, submission guidelines and a bilingual UI included.',
    'plugins.community.note':
      'Third-party site, not an official WeCi service. Review plugin source before installing.',
    'plugins.community.go': 'Visit Plugin Hub ↗',
    'plugins.community.submit': 'Publish my plugin ↗',
    'plugins.maker.eyebrow': 'Toolchain',
    'plugins.maker.title': 'weci-maker',
    'plugins.maker.desc':
      'The official plugin CLI, roughly the Cargo of WeCi. It does not reinvent the plugin architecture — it reuses the manifest validation, SDK and loader from WeCi itself, so it never drifts when validation rules change.',
    'plugins.maker.warn':
      '⚠️ A third-party Python plugin can execute arbitrary Python code. Permissions are a capability interface, not a sandbox. Do not install plugins from untrusted sources.',
    'plugins.detail.back': '← Back to plugins',
    'plugins.detail.source': 'Source repository ↗',

    'home.hero.badge': 'Open source · Local-first · OpenAI-compatible',
    'home.hero.title1': 'Chat quietly,',
    'home.hero.title2': 'or let the AI ',
    'home.hero.accent': 'get it done',
    'home.hero.title3': '.',
    'home.hero.lead':
      'WeCi is a clean, modern, open-source, local-first AI chat client + Agent workbench. No accounts, no database — history stays in your browser and you bring your own model endpoint.',
    'home.hero.github': 'View on GitHub',
    'home.hero.docs': 'Read the docs',
    'home.features.eyebrow': 'Features',
    'home.features.title': 'Everything you need, nothing you do not',
    'home.features.desc':
      'No extra panels, no forced cloud sync. Every feature solves a concrete problem.',
    'home.modes.eyebrow': 'Modes',
    'home.modes.title': 'Chat mode vs Agent mode',
    'home.modes.desc': 'One toggle in the header; each conversation remembers its mode.',
    'home.install.eyebrow': 'Quick Start',
    'home.install.title': 'Up and running in four commands',
    'home.install.desc':
      'Requires Python 3.10+ and an OpenAI-compatible endpoint. Open http://127.0.0.1:8000 after starting, then fill in Endpoint and Model in settings.',
    'home.install.note':
      'The key can also live server-side: copy .env.example to .env and set WECI_API_KEY, leaving the frontend empty.',
    'home.skills.eyebrow': 'Built-in Skills',
    'home.skills.title': 'Official skills, enabled by default',
    'home.skills.desc':
      'The Agent only talks to the ToolRegistry — Agent Core stays untouched when plugins are added.',
    'home.skills.col.name': 'Skill',
    'home.skills.col.tools': 'Tools',
    'home.skills.col.desc': 'Description',
    'home.skills.warn':
      '⚠️ The Computer skill lets the Agent run commands and modify files on your machine. Enable it only if you trust the Agent.',
    'home.docs.eyebrow': 'Documentation',
    'home.docs.title': 'Start here',
    'home.docs.desc':
      'Site documentation is rendered straight from the Markdown in the repository, always in sync with the source.',
    'home.cta.title': 'Local-first, starting with one weci serve',
    'home.cta.desc': 'Open source, self-hostable, no vendor lock-in.',
    'home.cta.github': 'GitHub repository',
    'home.cta.plugins': 'Build a plugin',
    'home.cta.community': 'Plugin Hub ↗',

    '404.title': 'Page not found',
    '404.desc': 'This address does not exist, or the document has moved.',
    '404.home': 'Back home',
    '404.docs': 'Browse docs',
  },
}

/** 供非组件环境（如 router afterEach）读取当前语言文案 */
export function tGlobal(key) {
  return pick(UI, key)
}

/** 文档内容语言 → 用于 <html lang> 与文档标题展示 */
export function docLangLabel(lang) {
  return lang === 'en' ? 'English' : '简体中文'
}
