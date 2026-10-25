<script setup>
import { ref, onMounted, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { locale, setLocale, toggleLocale, LOCALES, LOCALE_LABELS, UI } from '@/lib/i18n'
import { pageTitle } from '@/router'

defineProps({
  menuOpen: { type: Boolean, default: false },
})
defineEmits(['toggle-menu'])

const route = useRoute()
const router = useRouter()
const theme = ref('dark')

const nav = [
  { to: '/', key: 'nav.home' },
  { to: '/docs', key: 'nav.docs' },
  { to: '/plugins', key: 'nav.plugins' },
]

const PLUGHUB = 'https://plughub.pages.dev/'
const GITHUB = 'https://github.com/openwelabs/weci'

const t = (key) => UI[locale.value]?.[key] ?? UI['zh-CN'][key] ?? key

onMounted(() => {
  theme.value = document.documentElement.dataset.theme || 'dark'
})

// 语言切换后刷新页面标题
watch(locale, () => {
  document.title = pageTitle(route)
})

function toggleTheme() {
  const next = theme.value === 'dark' ? 'light' : 'dark'
  theme.value = next
  document.documentElement.dataset.theme = next
  try {
    localStorage.setItem('weci-web-theme', next)
  } catch (e) {
    /* ignore */
  }
}

function isActive(to) {
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}
</script>

<template>
  <header class="site-header">
    <div class="container site-header__inner">
      <RouterLink to="/" class="brand" :aria-label="t('nav.home')">
        <span class="brand__mark">W</span>
        <span class="brand__name">WeCi</span>
      </RouterLink>

      <nav class="nav" :class="{ 'nav--open': menuOpen }">
        <RouterLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="nav__link"
          :class="{ 'nav__link--active': isActive(item.to) }"
        >
          {{ t(item.key) }}
        </RouterLink>
        <a :href="PLUGHUB" class="nav__link nav__link--ext" target="_blank" rel="noopener noreferrer">
          {{ t('nav.community') }} ↗
        </a>
        <a :href="GITHUB" class="nav__link" target="_blank" rel="noopener noreferrer">
          {{ t('nav.github') }} ↗
        </a>
      </nav>

      <div class="actions">
        <!-- 语言切换 -->
        <div class="lang-switch" role="group" :aria-label="t('nav.lang')">
          <button
            v-for="code in LOCALES"
            :key="code"
            class="lang-switch__btn"
            type="button"
            :class="{ 'lang-switch__btn--active': locale === code }"
            :aria-pressed="locale === code"
            @click="setLocale(code)"
          >
            {{ LOCALE_LABELS[code] }}
          </button>
        </div>

        <button
          class="icon-btn"
          type="button"
          :aria-label="theme === 'dark' ? t('nav.theme.dark') : t('nav.theme.light')"
          :title="theme === 'dark' ? t('nav.theme.dark') : t('nav.theme.light')"
          @click="toggleTheme"
        >
          <span v-if="theme === 'dark'">☀</span>
          <span v-else>☾</span>
        </button>

        <button
          class="icon-btn menu-btn"
          type="button"
          :aria-label="t('nav.menu')"
          @click="$emit('toggle-menu')"
        >
          <span class="menu-btn__bars" :class="{ 'menu-btn__bars--x': menuOpen }">
            <i></i><i></i><i></i>
          </span>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: fixed;
  inset: 0 0 auto 0;
  height: var(--header-h);
  z-index: 50;
  background: color-mix(in srgb, var(--bg) 82%, transparent);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--border);
}

.site-header__inner {
  height: 100%;
  display: flex;
  align-items: center;
  gap: 28px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--text);
  font-weight: 700;
  font-size: 1.06rem;
  letter-spacing: -0.01em;
}
.brand:hover {
  text-decoration: none;
}

.brand__mark {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 9px;
  background: linear-gradient(135deg, var(--accent), #8b5cf6);
  color: #fff;
  font-family: var(--font-mono);
  font-size: 0.95rem;
}

.nav {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.nav__link {
  padding: 7px 13px;
  border-radius: var(--radius-sm);
  color: var(--text-dim);
  font-size: 0.93rem;
  font-weight: 500;
  transition: color var(--transition), background var(--transition);
}
.nav__link:hover {
  color: var(--text);
  background: var(--bg-elev-2);
  text-decoration: none;
}
.nav__link--active {
  color: var(--text);
  background: var(--bg-elev-2);
}
.nav__link--ext {
  color: var(--accent);
}
.nav__link--ext:hover {
  color: var(--accent);
  background: var(--accent-soft);
}

.actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ---------------------------- 语言切换 ---------------------------- */
.lang-switch {
  display: inline-flex;
  align-items: center;
  padding: 2px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-elev);
}

.lang-switch__btn {
  padding: 4px 9px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-faint);
  font-size: 0.76rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: color var(--transition), background var(--transition);
}

.lang-switch__btn:hover {
  color: var(--text);
}

.lang-switch__btn--active {
  background: var(--accent-soft);
  color: var(--accent);
}

.icon-btn {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-dim);
  font-size: 0.95rem;
  cursor: pointer;
  transition: color var(--transition), border-color var(--transition);
}
.icon-btn:hover {
  color: var(--text);
  border-color: var(--border-strong);
}

.menu-btn {
  display: none;
}

.menu-btn__bars {
  display: grid;
  gap: 3px;
  width: 16px;
}
.menu-btn__bars i {
  display: block;
  height: 1.6px;
  background: currentColor;
  border-radius: 2px;
  transition: transform var(--transition), opacity var(--transition);
}
.menu-btn__bars--x i:nth-child(1) {
  transform: translateY(4.6px) rotate(45deg);
}
.menu-btn__bars--x i:nth-child(2) {
  opacity: 0;
}
.menu-btn__bars--x i:nth-child(3) {
  transform: translateY(-4.6px) rotate(-45deg);
}

@media (max-width: 760px) {
  .menu-btn {
    display: grid;
  }

  .nav {
    position: fixed;
    top: var(--header-h);
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: stretch;
    gap: 2px;
    padding: 12px 18px 18px;
    background: var(--bg-elev);
    border-bottom: 1px solid var(--border);
    box-shadow: var(--shadow);
    transform: translateY(-8px);
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--transition), transform var(--transition);
  }

  .nav--open {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }

  .nav__link {
    padding: 11px 12px;
  }
}
</style>
