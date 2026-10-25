<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import MarkdownDoc from '@/components/MarkdownDoc.vue'
import { locale, UI } from '@/lib/i18n'
import {
  docGroups,
  getDocSource,
  getDocMeta,
  normalizeSlug,
  suggestDocs,
} from '@/lib/markdown'

const route = useRoute()

const t = (key) => UI[locale.value]?.[key] ?? UI['zh-CN'][key] ?? key

/** 路由参数可能是数组（/docs/a/b） */
const rawSlug = computed(() => {
  const s = route.params.slug
  return Array.isArray(s) ? s.join('/') : s || ''
})

const activeSlug = computed(() =>
  rawSlug.value ? normalizeSlug(rawSlug.value) : 'docs/weci-readme.zh-CN'
)

const groups = computed(() => docGroups(locale.value))

const source = computed(() => getDocSource(activeSlug.value))
const meta = computed(() => getDocMeta(activeSlug.value))
const notFound = computed(() => !source.value || !meta.value)

const suggestions = computed(() => (notFound.value ? suggestDocs(rawSlug.value || activeSlug.value) : []))

/** 文档标题按当前 UI 语言优先展示 */
function docTitle(doc) {
  return locale.value === 'en' ? doc.titleEn || doc.title : doc.title
}

/** 同一文档的其他语言版本 */
const alternate = computed(() => {
  if (!meta.value?.alternate) return null
  const other = getDocMeta(meta.value.alternate)
  if (!other) return null
  return other
})

const alternateLabel = computed(() => {
  if (!alternate.value) return ''
  return otherIsEn.value ? t('docs.langSwitchTo') : t('docs.langSwitchToZh')
})

const otherIsEn = computed(() => alternate.value?.lang === 'en')

/** 侧边栏高亮：兼容短 slug 与 docs/ 前缀 */
function isActive(doc) {
  return doc.slug === activeSlug.value
}

function docPath(doc) {
  return `/docs/${doc.routeSlug}`
}
</script>

<template>
  <div class="docs-page">
    <div class="container docs-page__layout">
      <!-- 侧边栏 -->
      <aside class="docs-nav">
        <div v-for="g in groups" :key="g.group" class="docs-nav__group">
          <p class="docs-nav__title">{{ g.label }}</p>
          <ul>
            <li v-for="doc in g.docs" :key="doc.slug">
              <RouterLink
                :to="docPath(doc)"
                class="docs-nav__link"
                :class="{ 'docs-nav__link--active': isActive(doc) }"
              >
                {{ docTitle(doc) }}
              </RouterLink>
            </li>
          </ul>
        </div>
      </aside>

      <!-- 正文 -->
      <div class="docs-content">
        <div v-if="notFound" class="docs-empty card">
          <h2>{{ t('docs.notFound.title') }}</h2>
          <p>
            {{ t('docs.notFound.desc') }}
            <code>{{ rawSlug || activeSlug }}</code>
          </p>

          <div v-if="suggestions.length" class="docs-empty__suggest">
            <p class="docs-empty__suggest-title">{{ t('docs.notFound.suggest') }}</p>
            <ul>
              <li v-for="doc in suggestions" :key="doc.slug">
                <RouterLink :to="docPath(doc)">{{ docTitle(doc) }}</RouterLink>
              </li>
            </ul>
          </div>

          <div class="docs-empty__actions">
            <RouterLink to="/docs/weci-readme.zh-CN" class="btn btn--primary">
              {{ t('docs.notFound.back') }}
            </RouterLink>
            <RouterLink to="/docs" class="btn btn--ghost">
              {{ t('docs.notFound.list') }}
            </RouterLink>
          </div>
        </div>

        <template v-else>
          <nav class="breadcrumb">
            <RouterLink to="/">{{ t('docs.breadcrumb.home') }}</RouterLink>
            <span>/</span>
            <RouterLink to="/docs">{{ t('docs.breadcrumb.docs') }}</RouterLink>
            <span>/</span>
            <span class="breadcrumb__current">{{ meta ? docTitle(meta) : activeSlug }}</span>
          </nav>

          <!-- 语言版本切换 -->
          <div v-if="alternate" class="doc-lang">
            <span class="doc-lang__label">{{ t('docs.langSwitch') }}</span>
            <RouterLink :to="`/docs/${alternate.routeSlug}`" class="doc-lang__link">
              {{ alternateLabel }} →
            </RouterLink>
          </div>

          <MarkdownDoc :source="source" />
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.docs-page {
  padding: 40px 0 80px;
}

.docs-page__layout {
  display: grid;
  grid-template-columns: 232px minmax(0, 1fr);
  gap: 44px;
  align-items: start;
}

/* ---------------------------- 侧边栏 ---------------------------- */
.docs-nav {
  position: sticky;
  top: calc(var(--header-h) + 28px);
  max-height: calc(100vh - var(--header-h) - 56px);
  overflow-y: auto;
  padding-right: 10px;
  border-right: 1px solid var(--border);
}

.docs-nav__group + .docs-nav__group {
  margin-top: 26px;
}

.docs-nav__title {
  margin: 0 0 8px;
  padding: 0 10px;
  font-size: 0.74rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-faint);
}

.docs-nav ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.docs-nav__link {
  display: block;
  padding: 7px 12px;
  border-radius: var(--radius-sm);
  color: var(--text-dim);
  font-size: 0.89rem;
  transition: color var(--transition), background var(--transition);
}

.docs-nav__link:hover {
  color: var(--text);
  background: var(--bg-elev-2);
  text-decoration: none;
}

.docs-nav__link--active {
  color: var(--accent);
  background: var(--accent-soft);
  font-weight: 600;
}

/* ---------------------------- 内容 ---------------------------- */
.docs-content {
  min-width: 0;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: var(--text-faint);
  margin-bottom: 16px;
}

.breadcrumb a {
  color: var(--text-faint);
}

.breadcrumb a:hover {
  color: var(--accent);
}

.breadcrumb__current {
  color: var(--text-dim);
}

/* ---------------------------- 语言版本切换 ---------------------------- */
.doc-lang {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 26px;
  padding: 9px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-elev);
  font-size: 0.82rem;
}

.doc-lang__label {
  color: var(--text-faint);
}

.doc-lang__link {
  color: var(--accent);
  font-weight: 600;
}

/* ---------------------------- 空状态 ---------------------------- */
.docs-empty {
  text-align: center;
  padding: 56px 24px;
}

.docs-empty h2 {
  margin: 0 0 10px;
}

.docs-empty p {
  color: var(--text-dim);
  margin: 0 0 22px;
}

.docs-empty__suggest {
  max-width: 420px;
  margin: 0 auto 24px;
  padding: 16px 20px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-elev);
  text-align: left;
}

.docs-empty__suggest-title {
  margin: 0 0 10px !important;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-faint) !important;
}

.docs-empty__suggest ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 6px;
}

.docs-empty__suggest a {
  font-size: 0.9rem;
}

.docs-empty__actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

@media (max-width: 960px) {
  .docs-page__layout {
    grid-template-columns: minmax(0, 1fr);
    gap: 24px;
  }

  .docs-nav {
    position: static;
    max-height: none;
    border-right: none;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-elev);
    padding: 14px 12px;
  }
}
</style>
