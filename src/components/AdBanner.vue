<script setup>
defineProps({
  type: {
    type: String,
    default: 'banner',
    validator: v => ['banner', 'sidebar'].includes(v)
  }
})
</script>

<template>
  <div
    class="ad-placeholder"
    :class="type === 'sidebar' ? 'ad-placeholder--sidebar' : 'ad-placeholder--banner'"
  >
    <span>Реклама</span>
  </div>
</template>

<style scoped>
.ad-placeholder {
  background: var(--ad-bg);
  border: 1px dashed var(--border);
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin: 2rem 0;
  transition: all 0.3s;
  cursor: pointer;
  user-select: none;
}

.ad-placeholder:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-light);
}

.ad-placeholder--sidebar {
  min-height: 300px;
}

.ad-placeholder--banner {
  min-height: 100px;
}
</style>
