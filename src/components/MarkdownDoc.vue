<script setup>
import { computed, ref, watch } from 'vue'
import { renderWithAnchors } from '@/lib/markdown'
import { locale, UI } from '@/lib/i18n'

const props = defineProps({
  source: { type: String, default: '' },
  loading: { type: Boolean, default: false },
})

const t = (key) => UI[locale.value]?.[key] ?? UI['zh-CN'][key] ?? key

const rendered = computed(() => renderWithAnchors(props.source))
const toc = computed(() =>
  rendered.value.headings.filter((h) => h.level === 2 || h.level === 3)
)

const copiedId = ref('')
const copyLabel = computed(() => (copiedId.value ? t('docs.copied') : t('docs.copy')))

// 内容变化时重置复制状态
watch(
  () => props.source,
  () => {
    copiedId.value = ''
  }
)

async function onClick(e) {
  const btn = e.target.closest('[data-copy]')
  if (!btn) return
  const code = btn.closest('.code-block')?.querySelector('code')?.textContent || ''
  const key = String(Math.random())
  try {
    await navigator.clipboard.writeText(code)
    btn.textContent = t('docs.copied')
  } catch (err) {
    btn.textContent = t('docs.copyFailed')
  }
  setTimeout(() => {
    btn.textContent = t('docs.copy')
  }, 1400)
  copiedId.value = key
}

// 语言切换后，重建代码块内的按钮文案
watch(locale, () => {
  copiedId.value = ''
})
</script>

<template>
  <div class="markdown-doc">
    <aside v-if="toc.length" class="markdown-doc__toc">
      <p class="markdown-doc__toc-title">{{ t('docs.toc') }}</p>
      <ul>
        <li v-for="h in toc" :key="h.id" :class="`lv${h.level}`">
          <a :href="`#${h.id}`">{{ h.text }}</a>
        </li>
      </ul>
    </aside>

    <div class="markdown-doc__body">
      <div v-if="loading" class="markdown-doc__loading">{{ t('docs.loading') }}</div>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <article v-else class="prose" v-html="rendered.html" @click="onClick"></article>
    </div>
  </div>
</template>

<style scoped>
.markdown-doc {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 48px;
  align-items: start;
}

.markdown-doc__toc {
  position: sticky;
  top: calc(var(--header-h) + 28px);
  max-height: calc(100vh - var(--header-h) - 56px);
  overflow-y: auto;
  padding-right: 8px;
  border-right: 1px solid var(--border);
}

.markdown-doc__toc-title {
  margin: 0 0 10px;
  font-size: 0.76rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-faint);
}

.markdown-doc__toc ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.markdown-doc__toc li {
  margin: 1px 0;
}

.markdown-doc__toc a {
  display: block;
  color: var(--text-dim);
  font-size: 0.85rem;
  line-height: 1.5;
  padding: 5px 10px 5px 12px;
  border-left: 2px solid transparent;
  border-radius: 0 6px 6px 0;
  transition: color var(--transition), background var(--transition),
    border-color var(--transition);
}

.markdown-doc__toc a:hover {
  color: var(--accent);
  background: var(--accent-soft);
  border-left-color: var(--accent);
  text-decoration: none;
}

.markdown-doc__toc li.lv3 a {
  padding-left: 24px;
  font-size: 0.81rem;
}

.markdown-doc__body {
  min-width: 0;
}

.markdown-doc__loading {
  color: var(--text-dim);
  padding: 40px 0;
}

@media (max-width: 960px) {
  .markdown-doc {
    grid-template-columns: minmax(0, 1fr);
    gap: 24px;
  }

  .markdown-doc__toc {
    position: static;
    max-height: none;
    border-right: none;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 14px 16px;
    background: var(--bg-elev);
  }
}
</style>
