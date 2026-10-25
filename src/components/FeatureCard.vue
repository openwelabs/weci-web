<script setup>
defineProps({
  icon: { type: String, default: '◆' },
  title: { type: String, required: true },
  desc: { type: String, default: '' },
  tags: { type: Array, default: () => [] },
})
</script>

<template>
  <article class="feature-card card">
    <div class="feature-card__icon">{{ icon }}</div>
    <h3 class="feature-card__title">{{ title }}</h3>
    <p class="feature-card__desc">{{ desc }}</p>
    <ul v-if="tags.length" class="feature-card__tags">
      <li v-for="tag in tags" :key="tag">{{ tag }}</li>
    </ul>
  </article>
</template>

<style scoped>
.feature-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.feature-card__icon {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 1.05rem;
  margin-bottom: 2px;
}

.feature-card__title {
  margin: 0;
  font-size: 1.02rem;
  letter-spacing: -0.01em;
}

.feature-card__desc {
  margin: 0;
  color: var(--text-dim);
  font-size: 0.9rem;
  line-height: 1.7;
}

.feature-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  list-style: none;
  margin: 6px 0 0;
  padding: 0;
}

.feature-card__tags li {
  font-family: var(--font-mono);
  font-size: 0.74rem;
  color: var(--text-faint);
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: 5px;
  padding: 1px 7px;
}
</style>
