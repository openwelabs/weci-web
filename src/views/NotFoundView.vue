<script setup>
import { RouterLink } from 'vue-router'
import { locale, UI } from '@/lib/i18n'

const t = (key) => UI[locale.value]?.[key] ?? UI['zh-CN'][key] ?? key
</script>

<template>
  <div class="not-found">
    <div class="container not-found__inner">
      <p class="not-found__code">404</p>
      <h1>{{ t('404.title') }}</h1>
      <p class="not-found__desc">{{ t('404.desc') }}</p>
      <div class="not-found__actions">
        <RouterLink to="/" class="btn btn--primary">{{ t('404.home') }}</RouterLink>
        <RouterLink to="/docs" class="btn btn--ghost">{{ t('404.docs') }}</RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  padding: 120px 0 140px;
}

.not-found__inner {
  text-align: center;
  max-width: 520px;
}

.not-found__code {
  margin: 0;
  font-family: var(--font-mono);
  font-size: clamp(3.4rem, 10vw, 5.4rem);
  font-weight: 700;
  letter-spacing: -0.04em;
  background: linear-gradient(120deg, var(--accent), #8b5cf6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.not-found h1 {
  margin: 0 0 12px;
  font-size: 1.5rem;
  letter-spacing: -0.02em;
}

.not-found__desc {
  margin: 0 0 28px;
  color: var(--text-dim);
}

.not-found__actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
