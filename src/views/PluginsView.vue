<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import MarkdownDoc from '@/components/MarkdownDoc.vue'
import { locale, UI } from '@/lib/i18n'
import { DOC_LIST, getDocSource, getDocMeta, normalizeSlug, suggestDocs } from '@/lib/markdown'

const route = useRoute()

const t = (key) => UI[locale.value]?.[key] ?? UI['zh-CN'][key] ?? key

const PLUGHUB = 'https://plughub.pages.dev/'
const GITHUB = 'https://github.com/openwelabs/weci'
const MAKER = 'https://github.com/openwelabs/weci-maker'

/** 列表页只展示插件分组下的文档 */
const pluginDocs = computed(() => DOC_LIST.filter((d) => d.group === 'plugins'))

const rawSlug = computed(() => {
  const s = route.params.slug
  return Array.isArray(s) ? s.join('/') : s || ''
})

/** 路由 /plugins/:slug → 内部 slug docs/plugins/:slug */
const activeSlug = computed(() => (rawSlug.value ? normalizeSlug(`plugins/${rawSlug.value}`) : ''))

const source = computed(() => (activeSlug.value ? getDocSource(activeSlug.value) : ''))
const meta = computed(() => (activeSlug.value ? getDocMeta(activeSlug.value) : null))
const notFound = computed(() => Boolean(activeSlug.value) && (!source.value || !meta.value))

const suggestions = computed(() =>
  notFound.value ? suggestDocs(`plugins/${rawSlug.value}`) : []
)

function docTitle(doc) {
  return locale.value === 'en' ? doc.titleEn || doc.title : doc.title
}

function docDesc(doc) {
  return locale.value === 'en' ? doc.descriptionEn || doc.description : doc.description
}

function pluginPath(doc) {
  return `/plugins/${doc.slug.replace(/^docs\/plugins\//, '')}`
}

const pipeline = computed(() => [
  { step: 'WeCi Core', desc: locale.value === 'en' ? 'FastAPI backend + static frontend' : 'FastAPI 后端 + 静态前端' },
  { step: 'PluginLoader', desc: locale.value === 'en' ? 'Scan dirs, validate manifest, load modules' : '扫描目录、校验 manifest、加载模块' },
  { step: 'PluginRegistry', desc: locale.value === 'en' ? 'Plugin lifecycle + tool registration' : '管理插件生命周期 + 工具注册' },
  { step: 'ToolRegistry', desc: locale.value === 'en' ? 'The only thing the Agent talks to' : 'Agent 唯一交互对象' },
  { step: 'Agent', desc: locale.value === 'en' ? 'Calls tools, unaware of plugins' : '只调用工具，不感知插件' },
])

const makerCmds = `weci-maker new my-plugin
cd my-plugin
weci-maker check
python -m pytest tests/
weci-maker build
weci-maker install dist/my-plugin-0.1.0.wcp`
</script>

<template>
  <div class="plugins-page">
    <!-- ============================ 列表页 ============================ -->
    <template v-if="!activeSlug">
      <section class="plugin-hero">
        <div class="container">
          <span class="eyebrow">{{ t('plugins.hero.eyebrow') }}</span>
          <h1>{{ t('plugins.hero.title') }}</h1>
          <p class="plugin-hero__lead">{{ t('plugins.hero.lead') }}</p>
          <div class="plugin-hero__actions">
            <RouterLink to="/plugins/quickstart" class="btn btn--primary">
              {{ t('plugins.hero.quickstart') }}
            </RouterLink>
            <a :href="MAKER" class="btn btn--ghost" target="_blank" rel="noopener noreferrer">
              weci-maker ↗
            </a>
            <a :href="PLUGHUB" class="btn btn--ghost" target="_blank" rel="noopener noreferrer">
              {{ t('plugins.hero.community') }} ↗
            </a>
          </div>
        </div>
      </section>

      <!-- 架构 -->
      <section class="section section--tight">
        <div class="container">
          <div class="section-head">
            <h2>{{ t('plugins.arch.title') }}</h2>
            <p>{{ t('plugins.arch.desc') }}</p>
          </div>
          <ol class="pipeline">
            <li v-for="(p, i) in pipeline" :key="p.step" class="pipeline__item">
              <span class="pipeline__index">{{ i + 1 }}</span>
              <div>
                <strong>{{ p.step }}</strong>
                <span class="pipeline__desc">{{ p.desc }}</span>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <!-- 文档卡片 -->
      <section class="section">
        <div class="container">
          <div class="section-head">
            <h2>{{ t('plugins.docs.title') }}</h2>
            <p>{{ t('plugins.docs.desc') }}</p>
          </div>
          <div class="grid grid--3">
            <RouterLink
              v-for="doc in pluginDocs"
              :key="doc.slug"
              :to="pluginPath(doc)"
              class="plugin-card card"
            >
              <h3>{{ docTitle(doc) }}</h3>
              <p>{{ docDesc(doc) }}</p>
              <span class="plugin-card__arrow">{{ t('plugins.docs.read') }}</span>
            </RouterLink>
          </div>
        </div>
      </section>

      <!-- 插件社区 -->
      <section class="section section--tight">
        <div class="container">
          <div class="community card">
            <div class="community__text">
              <span class="eyebrow">{{ t('plugins.community.eyebrow') }}</span>
              <h2>{{ t('plugins.community.title') }}</h2>
              <p>{{ t('plugins.community.desc') }}</p>
              <p class="community__note">{{ t('plugins.community.note') }}</p>
              <div class="community__actions">
                <a :href="PLUGHUB" class="btn btn--primary" target="_blank" rel="noopener noreferrer">
                  {{ t('plugins.community.go') }}
                </a>
                <a :href="PLUGHUB + 'submit'" class="btn btn--ghost" target="_blank" rel="noopener noreferrer">
                  {{ t('plugins.community.submit') }}
                </a>
              </div>
            </div>
            <div class="community__badge" aria-hidden="true">plughub.pages.dev</div>
          </div>
        </div>
      </section>

      <!-- 工具链 -->
      <section class="section section--alt">
        <div class="container maker">
          <div class="maker__text">
            <span class="eyebrow">{{ t('plugins.maker.eyebrow') }}</span>
            <h2>{{ t('plugins.maker.title') }}</h2>
            <p>{{ t('plugins.maker.desc') }}</p>
            <p class="maker__warn">{{ t('plugins.maker.warn') }}</p>
          </div>
          <div class="code-block">
            <div class="code-block__bar">
              <span class="code-block__lang">bash</span>
            </div>
            <pre class="code-block__pre"><code>{{ makerCmds }}</code></pre>
          </div>
        </div>
      </section>
    </template>

    <!-- ============================ 文档详情 ============================ -->
    <template v-else>
      <div class="container plugin-detail">
        <nav class="breadcrumb">
          <RouterLink to="/">{{ t('docs.breadcrumb.home') }}</RouterLink>
          <span>/</span>
          <RouterLink to="/plugins">{{ t('docs.breadcrumb.plugins') }}</RouterLink>
          <span>/</span>
          <span class="breadcrumb__current">{{ meta ? docTitle(meta) : rawSlug }}</span>
        </nav>

        <div v-if="notFound" class="plugin-empty card">
          <h2>{{ t('docs.notFound.title') }}</h2>
          <p>
            {{ t('docs.notFound.desc') }}
            <code>{{ rawSlug }}</code>
          </p>

          <div v-if="suggestions.length" class="plugin-empty__suggest">
            <p class="plugin-empty__suggest-title">{{ t('docs.notFound.suggest') }}</p>
            <ul>
              <li v-for="doc in suggestions" :key="doc.slug">
                <RouterLink :to="pluginPath(doc)">{{ docTitle(doc) }}</RouterLink>
              </li>
            </ul>
          </div>

          <RouterLink to="/plugins" class="btn btn--ghost">
            {{ t('docs.notFound.backPlugins') }}
          </RouterLink>
        </div>

        <MarkdownDoc v-else :source="source" />

        <div class="plugin-detail__foot">
          <RouterLink to="/plugins" class="btn btn--ghost">
            {{ t('plugins.detail.back') }}
          </RouterLink>
          <a :href="GITHUB" class="btn btn--ghost" target="_blank" rel="noopener noreferrer">
            {{ t('plugins.detail.source') }}
          </a>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* ---------------------------- Hero ---------------------------- */
.plugin-hero {
  padding: 72px 0 56px;
  background: var(--hero-glow), var(--bg);
  border-bottom: 1px solid var(--border);
}

.plugin-hero h1 {
  margin: 0 0 18px;
  font-size: clamp(1.9rem, 4vw, 2.7rem);
  letter-spacing: -0.03em;
  line-height: 1.2;
}

.plugin-hero__lead {
  margin: 0 0 28px;
  max-width: 720px;
  color: var(--text-dim);
  font-size: 1.02rem;
  line-height: 1.8;
}

.plugin-hero__actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* ---------------------------- 架构流水线 ---------------------------- */
.pipeline {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}

.pipeline__item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-elev);
}

.pipeline__index {
  flex: 0 0 22px;
  height: 22px;
  display: grid;
  place-items: center;
  border-radius: 6px;
  background: var(--accent-soft);
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 0.72rem;
}

.pipeline__item strong {
  display: block;
  font-family: var(--font-mono);
  font-size: 0.84rem;
  margin-bottom: 4px;
}

.pipeline__desc {
  display: block;
  color: var(--text-faint);
  font-size: 0.78rem;
  line-height: 1.55;
}

/* ---------------------------- 文档卡片 ---------------------------- */
.plugin-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--text);
}

.plugin-card:hover {
  text-decoration: none;
}

.plugin-card h3 {
  margin: 0;
  font-size: 1rem;
  font-family: var(--font-mono);
}

.plugin-card p {
  margin: 0;
  color: var(--text-dim);
  font-size: 0.87rem;
}

.plugin-card__arrow {
  margin-top: auto;
  padding-top: 8px;
  color: var(--accent);
  font-size: 0.84rem;
}

/* ---------------------------- 插件社区 ---------------------------- */
.community {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 32px;
  align-items: center;
  padding: 32px;
  border: 1px solid color-mix(in srgb, var(--accent) 28%, var(--border));
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--accent) 7%, transparent), transparent 60%),
    var(--bg-elev);
}

.community__text h2 {
  margin: 6px 0 12px;
  font-size: clamp(1.35rem, 2.4vw, 1.7rem);
  letter-spacing: -0.02em;
}

.community__text p {
  margin: 0 0 12px;
  max-width: 620px;
  color: var(--text-dim);
  font-size: 0.94rem;
  line-height: 1.75;
}

.community__note {
  color: var(--text-faint) !important;
  font-size: 0.82rem !important;
}

.community__actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 20px;
}

.community__badge {
  padding: 14px 20px;
  border-radius: var(--radius);
  border: 1px dashed var(--border-strong);
  color: var(--text-faint);
  font-family: var(--font-mono);
  font-size: 0.8rem;
  white-space: nowrap;
}

/* ---------------------------- 工具链 ---------------------------- */
.maker {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 48px;
  align-items: center;
}

.maker__text h2 {
  margin: 0 0 14px;
  font-size: clamp(1.5rem, 2.6vw, 1.9rem);
  font-family: var(--font-mono);
  letter-spacing: -0.02em;
}

.maker__text p {
  margin: 0 0 16px;
  color: var(--text-dim);
  font-size: 0.95rem;
}

.maker__warn {
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  border: 1px solid color-mix(in srgb, var(--amber) 35%, var(--border));
  background: color-mix(in srgb, var(--amber) 8%, transparent);
  font-size: 0.86rem !important;
}

.maker .code-block {
  margin: 0;
}

/* ---------------------------- 详情页 ---------------------------- */
.plugin-detail {
  padding: 40px 0 80px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: var(--text-faint);
  margin-bottom: 22px;
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

.plugin-empty {
  text-align: center;
  padding: 56px 24px;
}

.plugin-empty h2 {
  margin: 0 0 10px;
}

.plugin-empty p {
  color: var(--text-dim);
  margin: 0 0 22px;
}

.plugin-empty__suggest {
  max-width: 420px;
  margin: 0 auto 24px;
  padding: 16px 20px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-elev);
  text-align: left;
}

.plugin-empty__suggest-title {
  margin: 0 0 10px !important;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-faint) !important;
}

.plugin-empty__suggest ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 6px;
}

.plugin-empty__suggest a {
  font-size: 0.9rem;
}

.plugin-detail__foot {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}

@media (max-width: 1080px) {
  .pipeline {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .community {
    grid-template-columns: minmax(0, 1fr);
  }

  .community__badge {
    justify-self: start;
  }

  .maker {
    grid-template-columns: minmax(0, 1fr);
    gap: 28px;
  }
}

@media (max-width: 640px) {
  .pipeline {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
