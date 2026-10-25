<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import SiteHeader from '@/components/SiteHeader.vue'
import SiteFooter from '@/components/SiteFooter.vue'

const route = useRoute()
const isMenuOpen = ref(false)

watch(
  () => route.fullPath,
  () => {
    isMenuOpen.value = false
  }
)

function onKeydown(e) {
  if (e.key === 'Escape') isMenuOpen.value = false
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="app-shell">
    <SiteHeader :menu-open="isMenuOpen" @toggle-menu="isMenuOpen = !isMenuOpen" />

    <main class="app-main">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <SiteFooter />
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-main {
  flex: 1;
  padding-top: var(--header-h);
}
</style>
