<script setup>
defineProps({
  category: { type: Object, required: true }
})
</script>

<template>
  <router-link
    :to="{ name: 'category', params: { slug: category.slug } }"
    class="card category-card"
    :style="{ '--cat-color': category.color }"
  >
    <div class="category-card__icon" :style="{ background: category.color + '18' }">
      <span>{{ category.icon }}</span>
    </div>
    <h3 class="category-card__title">{{ category.name }}</h3>
    <p class="category-card__desc">{{ category.description }}</p>
    <span class="category-card__arrow">→</span>
  </router-link>
</template>

<style scoped>
.category-card {
  padding: 24px;
  position: relative;
  display: flex;
  flex-direction: column;
}

.category-card__icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  margin-bottom: 16px;
}

.category-card__title {
  font-size: 1.05rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.category-card__desc {
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.5;
  flex: 1;
}

.category-card__arrow {
  margin-top: 16px;
  font-size: 1.2rem;
  color: var(--cat-color, var(--accent));
  transition: transform 0.2s;
}

.category-card:hover .category-card__arrow {
  transform: translateX(6px);
}
</style>
