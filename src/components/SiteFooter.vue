<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { locale, UI } from '@/lib/i18n'

const t = (key) => UI[locale.value]?.[key] ?? UI['zh-CN'][key] ?? key

const year = computed(() => new Date().getFullYear())

const links = computed(() => [
  { label: t('footer.docs'), to: '/docs' },
  { label: t('footer.plugins'), to: '/plugins' },
  { label: t('footer.community'), href: 'https://plughub.pages.dev/' },
  { label: 'GitHub', href: 'https://github.com/openwelabs/weci' },
  { label: t('footer.maker'), href: 'https://github.com/openwelabs/weci-maker' },
])
</script>

<template>
  <footer class="site-footer">
    <div class="container site-footer__inner">
      <div class="site-footer__brand">
        <div class="site-footer__logo">
          <span class="site-footer__mark">W</span>
          <strong>WeCi</strong>
        </div>
        <p class="site-footer__tagline">{{ t('footer.tagline') }}</p>
      </div>

      <nav class="site-footer__links">
        <template v-for="link in links" :key="link.label">
          <RouterLink v-if="link.to" :to="link.to">{{ link.label }}</RouterLink>
          <a v-else :href="link.href" target="_blank" rel="noopener noreferrer">
            {{ link.label }} ↗
          </a>
        </template>
      </nav>
    </div>

    <div class="container site-footer__bottom">
      <span>© {{ year }} WeCi · {{ t('footer.rights') }}</span>
      <span>{{ t('footer.built') }}</span>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  border-top: 1px solid var(--border);
  background: var(--bg-elev);
  padding: 48px 0 28px;
}

.site-footer__inner {
  display: flex;
  justify-content: space-between;
  gap: 40px;
  flex-wrap: wrap;
}

.site-footer__logo {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 1.02rem;
  margin-bottom: 10px;
}

.site-footer__mark {
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--accent), #8b5cf6);
  color: #fff;
  font-family: var(--font-mono);
  font-size: 0.82rem;
}

.site-footer__tagline {
  margin: 0;
  color: var(--text-dim);
  font-size: 0.88rem;
  line-height: 1.7;
  white-space: pre-line;
}

.site-footer__links {
  display: flex;
  flex-direction: column;
  gap: 9px;
  font-size: 0.9rem;
}

.site-footer__links a {
  color: var(--text-dim);
}
.site-footer__links a:hover {
  color: var(--accent);
}

.site-footer__bottom {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 36px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
  color: var(--text-faint);
  font-size: 0.82rem;
}
</style>
