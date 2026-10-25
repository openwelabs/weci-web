import { createRouter, createWebHistory } from 'vue-router'
import { tGlobal, locale } from '@/lib/i18n'
import { normalizeSlug, docExists, getDocMeta } from '@/lib/markdown'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { titleKey: 'nav.home', title: 'WeCi — 本地优先的 AI 对话客户端 + Agent 工作台' },
  },
  {
    path: '/docs',
    name: 'docs',
    component: () => import('@/views/DocsView.vue'),
    meta: { titleKey: 'docs.title' },
  },
  {
    path: '/docs/:slug(.*)*',
    name: 'doc',
    component: () => import('@/views/DocsView.vue'),
    meta: { titleKey: 'docs.title' },
  },
  {
    path: '/plugins',
    name: 'plugins',
    component: () => import('@/views/PluginsView.vue'),
    meta: { titleKey: 'nav.plugins' },
  },
  {
    path: '/plugins/:slug',
    name: 'plugin-doc',
    component: () => import('@/views/PluginsView.vue'),
    meta: { titleKey: 'nav.plugins' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { titleKey: '404.title' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    if (to.hash) return { el: to.hash, top: 90, behavior: 'smooth' }
    return { top: 0 }
  },
})

/* ------------------------------------------------------------------ *
 * 文档 slug 归一化：把历史/别名链接重定向到规范地址，
 * 避免「文档不存在」的假 404。
 * ------------------------------------------------------------------ */
router.beforeEach((to) => {
  if (to.name !== 'doc') return true

  const raw = to.params.slug
  const input = Array.isArray(raw) ? raw.join('/') : raw || ''
  if (!input) {
    // /docs/ → 默认手册
    return { path: '/docs/weci-readme.zh-CN', replace: true }
  }

  const key = normalizeSlug(input)
  const canonical = key.replace(/^docs\//, '')

  if (!docExists(key)) {
    // 交给视图渲染「文档不存在」，同时把 slug 规范化，便于提示
    if (canonical !== input) {
      return { name: 'doc', params: { slug: canonical }, replace: true }
    }
    return true
  }

  if (canonical !== input) {
    return { name: 'doc', params: { slug: canonical }, replace: true }
  }
  return true
})

/* ------------------------------------------------------------------ *
 * 标题：支持 i18n + 文档标题
 * ------------------------------------------------------------------ */
export function pageTitle(to) {
  const name = to.name

  if (name === 'doc' || name === 'plugin-doc') {
    const raw = to.params.slug
    const input = Array.isArray(raw) ? raw.join('/') : raw || ''
    const meta = getDocMeta(name === 'plugin-doc' ? `plugins/${input}` : input)
    if (meta) {
      const title = locale.value === 'en' ? meta.titleEn : meta.title
      return `${title} — WeCi`
    }
    return `${tGlobal('docs.notFound.title')} — WeCi`
  }

  if (name === 'home') {
    return locale.value === 'en'
      ? 'WeCi — Local-first AI chat client + Agent workbench'
      : 'WeCi — 本地优先的 AI 对话客户端 + Agent 工作台'
  }

  if (name === 'plugins') {
    return locale.value === 'en' ? 'Plugins — WeCi' : '插件系统 — WeCi'
  }

  if (name === 'docs') {
    return locale.value === 'en' ? 'Docs — WeCi' : '文档 — WeCi'
  }

  if (name === 'not-found') {
    return locale.value === 'en' ? 'Page not found — WeCi' : '页面未找到 — WeCi'
  }

  return to.meta?.title || 'WeCi'
}

router.afterEach((to) => {
  document.title = pageTitle(to)
  document.documentElement.lang = locale.value
})

export default router
